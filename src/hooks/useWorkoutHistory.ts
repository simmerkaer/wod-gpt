import { useState, useEffect, useCallback } from 'react';
import { 
  SavedWorkout, 
  WorkoutHistoryFilters, 
  WorkoutHistoryResponse,
  UpdateWorkoutRequest
} from '../types/workoutHistory';
import { useAuth } from './useAuth';

interface UseWorkoutHistoryResult {
  workouts: SavedWorkout[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => void;
  updateWorkout: (id: string, updates: Omit<UpdateWorkoutRequest, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
}

export const useWorkoutHistory = (filters?: WorkoutHistoryFilters): UseWorkoutHistoryResult => {
  const { isAuthenticated } = useAuth();
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWorkouts = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkouts([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      // Fetch all workouts
      searchParams.append('limit', '1000'); // Large number to get all workouts
      searchParams.append('offset', '0');

      if (filters?.favorite) {
        searchParams.append('favorite', 'true');
      }
      if (filters?.search) {
        searchParams.append('search', filters.search);
      }
      if (filters?.format && filters.format.length > 0) {
        searchParams.append('formats', filters.format.join(','));
      }
      if (filters?.difficulty && filters.difficulty.length > 0) {
        searchParams.append('difficulties', filters.difficulty.join(','));
      }
      if (filters?.dateRange) {
        searchParams.append('startDate', filters.dateRange.start.toISOString());
        searchParams.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/workouts/history?${searchParams.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your workout history');
        }
        throw new Error(`Failed to load workout history: ${response.status}`);
      }

      const data: WorkoutHistoryResponse = await response.json();
      
      setWorkouts(data.workouts);
      setTotalCount(data.totalCount);

    } catch (err) {
      console.error('Error fetching workout history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout history');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters]);

  const refresh = useCallback(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const updateWorkout = useCallback(async (id: string, updates: Omit<UpdateWorkoutRequest, 'id'>) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to update workouts');
    }

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workout not found');
        }
        throw new Error(`Failed to update workout: ${response.status}`);
      }

      // Update local state
      setWorkouts(prev => 
        prev.map(workout => 
          workout.id === id 
            ? { ...workout, ...updates }
            : workout
        )
      );

    } catch (err) {
      console.error('Error updating workout:', err);
      throw err;
    }
  }, [isAuthenticated]);

  const deleteWorkout = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to delete workouts');
    }

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workout not found');
        }
        throw new Error(`Failed to delete workout: ${response.status}`);
      }

      // Update local state
      setWorkouts(prev => prev.filter(workout => workout.id !== id));
      setTotalCount(prev => prev - 1);

    } catch (err) {
      console.error('Error deleting workout:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Load initial data when authentication status changes or filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkouts();
    }
  }, [isAuthenticated, filters]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setWorkouts([]);
      setError(null);
      setTotalCount(0);
    }
  }, [isAuthenticated]);

  return {
    workouts,
    isLoading,
    error,
    totalCount,
    refresh,
    updateWorkout,
    deleteWorkout,
  };
};