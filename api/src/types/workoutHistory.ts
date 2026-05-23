export interface SavedWorkout {
  id: string;
  userId: string;
  workout: any; // Using any to match the existing WorkoutResponse from frontend
  savedAt: string;
  completedAt?: string | null;
  actualDuration?: number;
  notes?: string;
  /** Legacy field kept for compatibility with pre-existing blobs. No longer written. */
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
  completedAt?: string | null;
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
export const BLOB_CONTAINER_NAME = "workout-history";
/** Soft warning when a user's single blob grows large */
export const MAX_WORKOUTS_WARN = 500;
export const MAX_NOTES_LENGTH = 500;

/** Single blob per user (current format) */
export function getUserWorkoutBlobPath(userId: string): string {
  return `users/${userId}/workouts.json`;
}

/**
 * Legacy per-month path (pre-migration). Used by migrate script only.
 */
export function getLegacyMonthlyBlobPath(userId: string, date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `users/${userId}/${year}/${month}/workouts.json`;
}

/** Match users/{userId}/YYYY/MM/workouts.json */
export const LEGACY_MONTHLY_BLOB_REGEX =
  /^users\/([^/]+)\/(\d{4})\/(\d{2})\/workouts\.json$/;

/** Single blob per user: users/{userId}/workouts.json (not legacy monthly) */
export const SINGLE_USER_WORKOUT_BLOB_REGEX =
  /^users\/[^/]+\/workouts\.json$/;

export const ADMIN_GENERATIONS_BLOB_PATH = 'admin-stats/generations.json';

/** Blob path to record that we have already sent the "new user" email for this userId. */
export function getUserNotifiedBlobPath(userId: string): string {
  return `admin/user-notified/${userId}`;
}

export function validateSaveWorkoutRequest(
  request: SaveWorkoutRequest,
): string[] {
  const errors: string[] = [];

  if (!request.workout) {
    errors.push("Workout data is required");
  }

  if (request.notes && request.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes cannot exceed ${MAX_NOTES_LENGTH} characters`);
  }

  if (
    request.actualDuration &&
    (request.actualDuration < 0 || request.actualDuration > 600)
  ) {
    errors.push("Actual duration must be between 0 and 600 minutes");
  }

  return errors;
}

export function validateUpdateWorkoutRequest(
  request: UpdateWorkoutRequest,
): string[] {
  const errors: string[] = [];

  if (!request.id) {
    errors.push("Workout ID is required");
  }

  if (request.notes && request.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes cannot exceed ${MAX_NOTES_LENGTH} characters`);
  }

  if (request.rating && (request.rating < 1 || request.rating > 5)) {
    errors.push("Rating must be between 1 and 5");
  }

  if (
    request.completedAt !== undefined &&
    request.completedAt !== null &&
    Number.isNaN(new Date(request.completedAt).getTime())
  ) {
    errors.push("completedAt must be a valid ISO date string or null");
  }

  return errors;
}
