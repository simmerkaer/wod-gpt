import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { 
  SavedWorkout, 
  UserWorkoutCollection, 
  BLOB_CONTAINER_NAME, 
  getBlobPath,
  MAX_WORKOUTS_PER_FILE 
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

  async saveWorkout(userId: string, workout: SavedWorkout): Promise<void> {
    await this.ensureContainerExists();

    const now = new Date();
    const blobPath = getBlobPath(userId, now);
    const blobClient = this.getBlobClient(blobPath);

    try {
      // Get existing workouts for this month
      let collection: UserWorkoutCollection;
      
      try {
        const downloadResponse = await blobClient.download();
        const content = await this.streamToString(downloadResponse.readableStreamBody!);
        collection = JSON.parse(content);
      } catch (error) {
        // File doesn't exist, create new collection
        collection = {
          workouts: [],
          lastUpdated: now.toISOString()
        };
      }

      // Add new workout
      collection.workouts.unshift(workout); // Add to beginning for chronological order
      collection.lastUpdated = now.toISOString();

      // If too many workouts, create archive (optional - implement later)
      if (collection.workouts.length > MAX_WORKOUTS_PER_FILE) {
        console.warn(`User ${userId} has ${collection.workouts.length} workouts in ${blobPath}`);
      }

      // Save updated collection
      const content = JSON.stringify(collection, null, 2);
      await blobClient.upload(content, content.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
        metadata: {
          userId,
          lastUpdated: now.toISOString(),
          workoutCount: collection.workouts.length.toString()
        }
      });

    } catch (error) {
      console.error('Failed to save workout:', error);
      throw new Error('Failed to save workout to storage');
    }
  }

  async getWorkoutHistory(
    userId: string, 
    limit: number = 20, 
    offset: number = 0,
    monthsToSearch: number = 12
  ): Promise<{ workouts: SavedWorkout[]; totalCount: number }> {
    await this.ensureContainerExists();

    const workouts: SavedWorkout[] = [];
    const now = new Date();
    let totalCount = 0;

    try {
      // Search through recent months
      for (let monthOffset = 0; monthOffset < monthsToSearch; monthOffset++) {
        const searchDate = new Date(now);
        searchDate.setMonth(searchDate.getMonth() - monthOffset);
        
        const blobPath = getBlobPath(userId, searchDate);
        const blobClient = this.getBlobClient(blobPath);

        try {
          const downloadResponse = await blobClient.download();
          const content = await this.streamToString(downloadResponse.readableStreamBody!);
          const collection: UserWorkoutCollection = JSON.parse(content);
          
          workouts.push(...collection.workouts);
          totalCount += collection.workouts.length;

        } catch (error) {
          // File doesn't exist for this month, continue
          continue;
        }

        // Break early if we have enough workouts
        if (workouts.length >= offset + limit) {
          break;
        }
      }

      // Sort by savedAt descending (most recent first)
      workouts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

      // Apply pagination
      const paginatedWorkouts = workouts.slice(offset, offset + limit);

      return {
        workouts: paginatedWorkouts,
        totalCount
      };

    } catch (error) {
      console.error('Failed to get workout history:', error);
      throw new Error('Failed to retrieve workout history');
    }
  }

  async updateWorkout(userId: string, workoutId: string, updates: Partial<SavedWorkout>): Promise<boolean> {
    await this.ensureContainerExists();

    const now = new Date();
    let found = false;

    try {
      // Search through recent months to find the workout
      for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const searchDate = new Date(now);
        searchDate.setMonth(searchDate.getMonth() - monthOffset);
        
        const blobPath = getBlobPath(userId, searchDate);
        const blobClient = this.getBlobClient(blobPath);

        try {
          const downloadResponse = await blobClient.download();
          const content = await this.streamToString(downloadResponse.readableStreamBody!);
          const collection: UserWorkoutCollection = JSON.parse(content);
          
          // Find and update the workout
          const workoutIndex = collection.workouts.findIndex(w => w.id === workoutId);
          
          if (workoutIndex !== -1) {
            collection.workouts[workoutIndex] = {
              ...collection.workouts[workoutIndex],
              ...updates
            };
            collection.lastUpdated = now.toISOString();

            // Save updated collection
            const updatedContent = JSON.stringify(collection, null, 2);
            await blobClient.upload(updatedContent, updatedContent.length, {
              blobHTTPHeaders: { blobContentType: 'application/json' },
              metadata: {
                userId,
                lastUpdated: now.toISOString(),
                workoutCount: collection.workouts.length.toString()
              }
            });

            found = true;
            break;
          }

        } catch (error) {
          // File doesn't exist for this month, continue
          continue;
        }
      }

      return found;

    } catch (error) {
      console.error('Failed to update workout:', error);
      throw new Error('Failed to update workout');
    }
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<boolean> {
    await this.ensureContainerExists();

    const now = new Date();
    let found = false;

    try {
      // Search through recent months to find the workout
      for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const searchDate = new Date(now);
        searchDate.setMonth(searchDate.getMonth() - monthOffset);
        
        const blobPath = getBlobPath(userId, searchDate);
        const blobClient = this.getBlobClient(blobPath);

        try {
          const downloadResponse = await blobClient.download();
          const content = await this.streamToString(downloadResponse.readableStreamBody!);
          const collection: UserWorkoutCollection = JSON.parse(content);
          
          // Find and remove the workout
          const initialLength = collection.workouts.length;
          collection.workouts = collection.workouts.filter(w => w.id !== workoutId);
          
          if (collection.workouts.length < initialLength) {
            collection.lastUpdated = now.toISOString();

            // Save updated collection
            const updatedContent = JSON.stringify(collection, null, 2);
            await blobClient.upload(updatedContent, updatedContent.length, {
              blobHTTPHeaders: { blobContentType: 'application/json' },
              metadata: {
                userId,
                lastUpdated: now.toISOString(),
                workoutCount: collection.workouts.length.toString()
              }
            });

            found = true;
            break;
          }

        } catch (error) {
          // File doesn't exist for this month, continue
          continue;
        }
      }

      return found;

    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw new Error('Failed to delete workout');
    }
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
}