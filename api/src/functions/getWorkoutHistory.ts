import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { WorkoutHistoryFilters, WorkoutHistoryResponse } from '../types/workoutHistory';

export async function getWorkoutHistory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Get workout history request received');

  try {
    // Validate request method
    if (request.method !== 'GET') {
      return {
        status: 405,
        jsonBody: { error: 'Method not allowed' }
      };
    }

    // Get user info from headers (Azure Static Web Apps authentication)
    const userPrincipal = request.headers.get('x-ms-client-principal');
    if (!userPrincipal) {
      return {
        status: 401,
        jsonBody: { error: 'Unauthorized - user not authenticated' }
      };
    }

    let userId: string;
    try {
      const userInfo = JSON.parse(Buffer.from(userPrincipal, 'base64').toString());
      userId = userInfo.userId || userInfo.userDetails;
      
      if (!userId) {
        throw new Error('User ID not found in authentication data');
      }
    } catch (error) {
      context.error('Failed to parse user principal:', error);
      return {
        status: 401,
        jsonBody: { error: 'Invalid authentication data' }
      };
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100); // Max 100
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);
    const favorite = url.searchParams.get('favorite') === 'true';
    const search = url.searchParams.get('search') || undefined;
    const formats = url.searchParams.get('formats')?.split(',') || undefined;
    const difficulties = url.searchParams.get('difficulties')?.split(',') || undefined;
    
    // Parse date range
    let dateRange: { start: string; end: string } | undefined;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate };
    }

    const filters: WorkoutHistoryFilters = {
      limit,
      offset,
      favorite: favorite || undefined,
      search,
      format: formats,
      difficulty: difficulties,
      dateRange
    };

    // Get workouts from blob storage
    const blobService = new BlobStorageService();
    const result = await blobService.getWorkoutHistory(userId, limit, offset);

    // Apply additional filters (that couldn't be done at storage level)
    let filteredWorkouts = result.workouts;

    if (filters.favorite) {
      filteredWorkouts = filteredWorkouts.filter(w => w.favorite === true);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredWorkouts = filteredWorkouts.filter(w => 
        w.workout.workout.text.toLowerCase().includes(searchLower) ||
        w.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.format && filters.format.length > 0) {
      filteredWorkouts = filteredWorkouts.filter(w => 
        filters.format!.includes(w.workout.workout.format)
      );
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredWorkouts = filteredWorkouts.filter(w => 
        filters.difficulty!.includes(w.workout.workout.difficulty)
      );
    }

    if (filters.dateRange) {
      const startTime = new Date(filters.dateRange.start).getTime();
      const endTime = new Date(filters.dateRange.end).getTime();
      filteredWorkouts = filteredWorkouts.filter(w => {
        const workoutTime = new Date(w.completedAt || w.savedAt).getTime();
        return workoutTime >= startTime && workoutTime <= endTime;
      });
    }

    const response: WorkoutHistoryResponse = {
      workouts: filteredWorkouts.slice(0, limit), // Re-apply limit after filtering
      totalCount: result.totalCount, // Use original total count from blob storage
      hasMore: offset + limit < result.totalCount // Based on original total count
    };

    context.log(`Retrieved ${response.workouts.length} workouts for user ${userId}`);

    return {
      status: 200,
      jsonBody: response
    };

  } catch (error) {
    context.error('Error getting workout history:', error);
    
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

// Register the function
app.http('getWorkoutHistory', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getWorkoutHistory,
  route: 'workouts/history'
});