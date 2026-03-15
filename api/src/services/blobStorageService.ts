import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import {
  SavedWorkout,
  UserWorkoutCollection,
  BLOB_CONTAINER_NAME,
  getUserWorkoutBlobPath,
  MAX_WORKOUTS_WARN,
  SINGLE_USER_WORKOUT_BLOB_REGEX,
  ADMIN_GENERATIONS_BLOB_PATH,
} from '../types/workoutHistory';

export interface AdminUserRow {
  /** Storage key (often email or GitHub username). */
  userId: string;
  workoutCount: number;
  favoriteCount: number;
  /** Latest generation/save time among saved workouts (system.generated or savedAt). */
  lastWorkoutAt?: string;
}

export interface AdminDashboardStats {
  userCount: number;
  totalSavedWorkouts: number;
  totalFavorites: number;
  totalGenerations: number;
  generationsToday: number;
  statsComputedAt: string;
  users: AdminUserRow[];
}

export interface GenerationStatsBlob {
  total: number;
  daily: Record<string, number>;
  lastUpdated: string;
}

export class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
  }

  private async ensureContainerExists(): Promise<void> {
    try {
      await this.containerClient.createIfNotExists();
    } catch (error) {
      console.error('Failed to create container:', error);
      throw new Error('Failed to initialize storage container');
    }
  }

  private getBlobClient(blobPath: string): BlockBlobClient {
    return this.containerClient.getBlockBlobClient(blobPath);
  }

  private async streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
      readableStream.on('error', reject);
    });
  }

  private async loadCollection(blobClient: BlockBlobClient): Promise<UserWorkoutCollection | null> {
    try {
      const downloadResponse = await blobClient.download();
      const content = await this.streamToString(downloadResponse.readableStreamBody!);
      return JSON.parse(content) as UserWorkoutCollection;
    } catch {
      return null;
    }
  }

  private async saveCollection(
    userId: string,
    blobClient: BlockBlobClient,
    collection: UserWorkoutCollection,
  ): Promise<void> {
    const now = new Date().toISOString();
    collection.lastUpdated = now;
    const content = JSON.stringify(collection, null, 2);
    const favoriteCount = collection.workouts.filter((w) => w.favorite === true).length;
    await blobClient.upload(content, content.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' },
      metadata: {
        userId,
        lastUpdated: now,
        workoutCount: collection.workouts.length.toString(),
        favoriteCount: favoriteCount.toString(),
      },
    });
  }

  /** Max ISO timestamp: per workout use AI generation time if stored, else savedAt. */
  private lastWorkoutGeneratedAt(workouts: SavedWorkout[]): string | undefined {
    let best = 0;
    let bestIso: string | undefined;
    for (const w of workouts) {
      const generated =
        w.workout &&
        typeof w.workout === 'object' &&
        w.workout.system &&
        typeof w.workout.system.generated === 'string'
          ? w.workout.system.generated
          : null;
      const savedAt = w.savedAt;
      const tGen = generated ? new Date(generated).getTime() : NaN;
      const tSaved = savedAt ? new Date(savedAt).getTime() : NaN;
      const iso = !Number.isNaN(tGen) ? generated! : !Number.isNaN(tSaved) ? savedAt : null;
      const t = !Number.isNaN(tGen) ? tGen : tSaved;
      if (!Number.isNaN(t) && t >= best) {
        best = t;
        bestIso = iso ?? undefined;
      }
    }
    return bestIso;
  }

  /**
   * Admin: list users/{id}/workouts.json blobs, aggregate counts; scan JSON for favorites (incl. legacy blobs).
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    await this.ensureContainerExists();
    const statsComputedAt = new Date().toISOString();
    let userCount = 0;
    let totalSavedWorkouts = 0;
    let totalFavorites = 0;
    const users: AdminUserRow[] = [];
    const userIdFromPath = /^users\/([^/]+)\/workouts\.json$/;

    for await (const item of this.containerClient.listBlobsFlat({ prefix: 'users/' })) {
      if (!item.name || !SINGLE_USER_WORKOUT_BLOB_REGEX.test(item.name)) continue;
      const m = item.name.match(userIdFromPath);
      const userId = m ? decodeURIComponent(m[1]) : item.name;
      userCount += 1;
      const client = this.getBlobClient(item.name);
      const col = await this.loadCollection(client);
      const workouts = col?.workouts ?? [];
      const workoutCount = workouts.length;
      const favoriteCount = workouts.filter((w) => w.favorite === true).length;
      totalSavedWorkouts += workoutCount;
      totalFavorites += favoriteCount;
      users.push({
        userId,
        workoutCount,
        favoriteCount,
        lastWorkoutAt: this.lastWorkoutGeneratedAt(workouts),
      });
    }

    users.sort((a, b) => b.workoutCount - a.workoutCount || a.userId.localeCompare(b.userId));

    const gen = await this.getGenerationStats();
    const today = new Date().toISOString().slice(0, 10);
    return {
      userCount,
      totalSavedWorkouts,
      totalFavorites,
      totalGenerations: gen.total,
      generationsToday: gen.daily[today] ?? 0,
      statsComputedAt,
      users,
    };
  }

  async getGenerationStats(): Promise<GenerationStatsBlob> {
    await this.ensureContainerExists();
    const client = this.getBlobClient(ADMIN_GENERATIONS_BLOB_PATH);
    try {
      const downloadResponse = await client.download();
      const content = await this.streamToString(downloadResponse.readableStreamBody!);
      const parsed = JSON.parse(content) as GenerationStatsBlob;
      return {
        total: typeof parsed.total === 'number' ? parsed.total : 0,
        daily: typeof parsed.daily === 'object' && parsed.daily ? parsed.daily : {},
        lastUpdated: parsed.lastUpdated || '',
      };
    } catch {
      return { total: 0, daily: {}, lastUpdated: '' };
    }
  }

  /** Increment generation counter (best-effort; concurrent requests may occasionally lose an increment). */
  async incrementGenerationCount(): Promise<void> {
    try {
      await this.ensureContainerExists();
      const client = this.getBlobClient(ADMIN_GENERATIONS_BLOB_PATH);
      const now = new Date().toISOString();
      const day = now.slice(0, 10);
      let total = 0;
      const daily: Record<string, number> = {};
      try {
        const downloadResponse = await client.download();
        const content = await this.streamToString(downloadResponse.readableStreamBody!);
        const parsed = JSON.parse(content) as GenerationStatsBlob;
        total = parsed.total || 0;
        Object.assign(daily, parsed.daily || {});
      } catch {
        /* first write */
      }
      total += 1;
      daily[day] = (daily[day] || 0) + 1;
      const body = JSON.stringify({
        total,
        daily,
        lastUpdated: now,
      } as GenerationStatsBlob);
      await client.upload(body, Buffer.byteLength(body), {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      });
    } catch (e) {
      console.error('incrementGenerationCount failed', e);
    }
  }

  /** Returns true if the user has a workout blob (e.g. has saved at least one workout or had one auto-saved). */
  async userWorkoutBlobExists(userId: string): Promise<boolean> {
    try {
      await this.ensureContainerExists();
      const blobClient = this.getBlobClient(getUserWorkoutBlobPath(userId));
      return await blobClient.exists();
    } catch {
      return false;
    }
  }

  async saveWorkout(userId: string, workout: SavedWorkout): Promise<void> {
    await this.ensureContainerExists();

    const blobPath = getUserWorkoutBlobPath(userId);
    const blobClient = this.getBlobClient(blobPath);
    const now = new Date();

    try {
      let collection =
        (await this.loadCollection(blobClient)) ?? {
          workouts: [],
          lastUpdated: now.toISOString(),
        };

      if (!Array.isArray(collection.workouts)) {
        collection.workouts = [];
      }

      collection.workouts.unshift(workout);
      collection.lastUpdated = now.toISOString();

      if (collection.workouts.length > MAX_WORKOUTS_WARN) {
        console.warn(
          `User ${userId} has ${collection.workouts.length} workouts in ${blobPath}`,
        );
      }

      await this.saveCollection(userId, blobClient, collection);
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw new Error('Failed to save workout to storage');
    }
  }

  async getWorkoutHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    _monthsToSearch?: number,
  ): Promise<{ workouts: SavedWorkout[]; totalCount: number }> {
    await this.ensureContainerExists();

    const blobClient = this.getBlobClient(getUserWorkoutBlobPath(userId));

    try {
      const collection = await this.loadCollection(blobClient);
      const workouts = collection?.workouts ?? [];

      workouts.sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );

      const totalCount = workouts.length;
      const paginatedWorkouts = workouts.slice(offset, offset + limit);

      return {
        workouts: paginatedWorkouts,
        totalCount,
      };
    } catch (error) {
      console.error('Failed to get workout history:', error);
      throw new Error('Failed to retrieve workout history');
    }
  }

  async updateWorkout(
    userId: string,
    workoutId: string,
    updates: Partial<SavedWorkout>,
  ): Promise<boolean> {
    await this.ensureContainerExists();

    const blobClient = this.getBlobClient(getUserWorkoutBlobPath(userId));

    try {
      const collection = await this.loadCollection(blobClient);
      if (!collection?.workouts?.length) {
        return false;
      }

      const workoutIndex = collection.workouts.findIndex((w) => w.id === workoutId);
      if (workoutIndex === -1) {
        return false;
      }

      collection.workouts[workoutIndex] = {
        ...collection.workouts[workoutIndex],
        ...updates,
      };

      await this.saveCollection(userId, blobClient, collection);
      return true;
    } catch (error) {
      console.error('Failed to update workout:', error);
      throw new Error('Failed to update workout');
    }
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<boolean> {
    await this.ensureContainerExists();

    const blobClient = this.getBlobClient(getUserWorkoutBlobPath(userId));

    try {
      const collection = await this.loadCollection(blobClient);
      if (!collection?.workouts?.length) {
        return false;
      }

      const initialLength = collection.workouts.length;
      collection.workouts = collection.workouts.filter((w) => w.id !== workoutId);
      if (collection.workouts.length === initialLength) {
        return false;
      }

      await this.saveCollection(userId, blobClient, collection);
      return true;
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw new Error('Failed to delete workout');
    }
  }
}
