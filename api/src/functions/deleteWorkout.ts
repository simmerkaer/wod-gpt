import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';

export async function deleteWorkout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Delete workout request received');

  try {
    // Validate request method
    if (request.method !== 'DELETE') {
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

    // Get workout ID from URL params
    const workoutId = request.params.id;
    if (!workoutId) {
      return {
        status: 400,
        jsonBody: { error: 'Workout ID is required' }
      };
    }

    // Delete workout from blob storage
    const blobService = new BlobStorageService();
    const found = await blobService.deleteWorkout(userId, workoutId);

    if (!found) {
      return {
        status: 404,
        jsonBody: { error: 'Workout not found' }
      };
    }

    context.log(`Workout ${workoutId} deleted successfully for user ${userId}`);
    
    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Workout deleted successfully'
      }
    };

  } catch (error) {
    context.error('Error deleting workout:', error);
    
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
app.http('deleteWorkout', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: deleteWorkout,
  route: 'workouts/{id}'
});