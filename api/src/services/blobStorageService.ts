import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import {
  SavedWorkout,
  UserWorkoutCollection,
  BLOB_CONTAINER_NAME,
  getUserWorkoutBlobPath,
  MAX_WORKOUTS_WARN,
} from '../types/workoutHistory';

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
    await blobClient.upload(content, content.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' },
      metadata: {
        userId,
        lastUpdated: now,
        workoutCount: collection.workouts.length.toString(),
      },
    });
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
