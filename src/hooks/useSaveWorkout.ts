import { useState, useCallback } from 'react';
import { SaveWorkoutRequest } from '../types/workoutHistory';
import { WorkoutResponse } from '../types/workout';
import { useAuth } from './useAuth';

interface UseSaveWorkoutResult {
  saveWorkout: (
    workout: WorkoutResponse, 
    options?: {
      completedAt?: string;
      actualDuration?: number;
      notes?: string;
    }
  ) => Promise<string>; // Returns workout ID
  isLoading: boolean;
  error: string | null;
}

export const useSaveWorkout = (): UseSaveWorkoutResult => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveWorkout = useCallback(async (
    workout: WorkoutResponse, 
    options?: {
      completedAt?: string;
      actualDuration?: number;
      notes?: string;
    }
  ): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save workouts');
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody: SaveWorkoutRequest = {
        workout,
        completedAt: options?.completedAt,
        actualDuration: options?.actualDuration,
        notes: options?.notes,
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to save workouts');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Failed to save workout: ${response.status}`
        );
      }

      const result = await response.json();
      return result.workoutId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workout';
      setError(errorMessage);
      console.error('Error saving workout:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return {
    saveWorkout,
    isLoading,
    error,
  };
};