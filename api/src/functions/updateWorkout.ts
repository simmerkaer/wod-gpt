import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { 
  UpdateWorkoutRequest, 
  validateUpdateWorkoutRequest 
} from '../types/workoutHistory';

export async function updateWorkout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Update workout request received');

  try {
    // Validate request method
    if (request.method !== 'PUT' && request.method !== 'PATCH') {
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

    // Parse request body
    let requestBody: UpdateWorkoutRequest;
    try {
      const body = await request.text();
      requestBody = JSON.parse(body);
    } catch (error) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid JSON in request body' }
      };
    }

    // Validate request
    const validationErrors = validateUpdateWorkoutRequest(requestBody);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        jsonBody: { 
          error: 'Validation failed',
          details: validationErrors
        }
      };
    }

    // Update workout in blob storage
    const blobService = new BlobStorageService();
    const updateData: Partial<any> = {};
    
    if (requestBody.notes !== undefined) {
      updateData.notes = requestBody.notes;
    }
    if (requestBody.favorite !== undefined) {
      updateData.favorite = requestBody.favorite;
    }
    if (requestBody.rating !== undefined) {
      updateData.rating = requestBody.rating;
    }

    const found = await blobService.updateWorkout(userId, requestBody.id, updateData);

    if (!found) {
      return {
        status: 404,
        jsonBody: { error: 'Workout not found' }
      };
    }

    context.log(`Workout ${requestBody.id} updated successfully for user ${userId}`);
    
    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Workout updated successfully'
      }
    };

  } catch (error) {
    context.error('Error updating workout:', error);
    
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
app.http('updateWorkout', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  handler: updateWorkout,
  route: 'workouts/{id}'
});