import { WorkoutResponse, DifficultyLevel } from './workout';
import { WorkoutFormat } from '@/components/SpecificFormatSelector';

export interface SavedWorkout {
  id: string;
  userId: string;
  workout: WorkoutResponse;
  savedAt: string; // ISO timestamp when saved
  completedAt?: string; // ISO timestamp when actually performed
  actualDuration?: number; // Actual minutes spent on workout
  notes?: string;
  favorite?: boolean;
  rating?: number; // 1-5 stars
}

export interface WorkoutHistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  format?: WorkoutFormat[];
  difficulty?: DifficultyLevel[];
  favorite?: boolean;
  search?: string; // Search in workout text or notes
  limit?: number; // Number of workouts to fetch
  offset?: number; // For pagination
}

export interface WorkoutHistoryResponse {
  workouts: SavedWorkout[];
  totalCount: number;
  hasMore: boolean;
}

export interface SaveWorkoutRequest {
  workout: WorkoutResponse;
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

// Utility types for API responses
export interface WorkoutHistoryError {
  message: string;
  code?: string;
}

// Constants
export const WORKOUTS_PER_PAGE = 10;
export const MAX_NOTES_LENGTH = 500;
export const MAX_SEARCH_LENGTH = 100;

// Helper functions
export function formatWorkoutDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatWorkoutDateTime(date: string): string {
  return new Date(date).toLocaleString();
}

export function getDurationDifference(planned: number, actual?: number): number | null {
  if (!actual) return null;
  return actual - planned;
}

export function getWorkoutPreview(workoutText: string, maxLength: number = 100): string {
  if (workoutText.length <= maxLength) return workoutText;
  return workoutText.substring(0, maxLength - 3) + '...';
}