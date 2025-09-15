import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { 
  SaveWorkoutRequest, 
  SavedWorkout, 
  validateSaveWorkoutRequest 
} from '../types/workoutHistory';
import { v4 as uuidv4 } from 'uuid';

export async function saveWorkout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Save workout request received');

  try {
    // Validate request method
    if (request.method !== 'POST') {
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
    let requestBody: SaveWorkoutRequest;
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
    const validationErrors = validateSaveWorkoutRequest(requestBody);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        jsonBody: { 
          error: 'Validation failed',
          details: validationErrors
        }
      };
    }

    // Create saved workout object
    const now = new Date().toISOString();
    const savedWorkout: SavedWorkout = {
      id: uuidv4(),
      userId,
      workout: requestBody.workout,
      savedAt: now,
      completedAt: requestBody.completedAt || now,
      actualDuration: requestBody.actualDuration,
      notes: requestBody.notes,
      favorite: false,
      rating: undefined
    };

    // Save to blob storage
    const blobService = new BlobStorageService();
    await blobService.saveWorkout(userId, savedWorkout);

    context.log(`Workout saved successfully for user ${userId}`);
    
    return {
      status: 201,
      jsonBody: {
        success: true,
        workoutId: savedWorkout.id,
        message: 'Workout saved successfully'
      }
    };

  } catch (error) {
    context.error('Error saving workout:', error);
    
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
app.http('saveWorkout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: saveWorkout,
  route: 'workouts'
});