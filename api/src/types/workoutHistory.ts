export interface SavedWorkout {
  id: string;
  userId: string;
  workout: any; // Using any to match the existing WorkoutResponse from frontend
  savedAt: string;
  completedAt?: string;
  actualDuration?: number;
  notes?: string;
  favorite?: boolean;
  rating?: number;
}

export interface WorkoutHistoryFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  format?: string[];
  difficulty?: string[];
  favorite?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SaveWorkoutRequest {
  workout: any;
  completedAt?: string;
  actualDuration?: number;
  notes?: string;
}

export interface UpdateWorkoutRequest {
  id: string;
  notes?: string;
  favorite?: boolean;
  rating?: number;
}

export interface WorkoutHistoryResponse {
  workouts: SavedWorkout[];
  totalCount: number;
  hasMore: boolean;
}

// Blob storage structure
export interface UserWorkoutCollection {
  workouts: SavedWorkout[];
  lastUpdated: string;
}

// Constants
export const BLOB_CONTAINER_NAME = 'workout-history';
export const MAX_WORKOUTS_PER_FILE = 50; // Limit per month file
export const MAX_NOTES_LENGTH = 500;

// Utility functions
export function getBlobPath(userId: string, date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `users/${userId}/${year}/${month}/workouts.json`;
}

export function validateSaveWorkoutRequest(request: SaveWorkoutRequest): string[] {
  const errors: string[] = [];
  
  if (!request.workout) {
    errors.push('Workout data is required');
  }
  
  if (request.notes && request.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes cannot exceed ${MAX_NOTES_LENGTH} characters`);
  }
  
  if (request.actualDuration && (request.actualDuration < 0 || request.actualDuration > 600)) {
    errors.push('Actual duration must be between 0 and 600 minutes');
  }
  
  return errors;
}

export function validateUpdateWorkoutRequest(request: UpdateWorkoutRequest): string[] {
  const errors: string[] = [];
  
  if (!request.id) {
    errors.push('Workout ID is required');
  }
  
  if (request.notes && request.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes cannot exceed ${MAX_NOTES_LENGTH} characters`);
  }
  
  if (request.rating && (request.rating < 1 || request.rating > 5)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return errors;
}