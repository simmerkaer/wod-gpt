import { useState, useEffect, useCallback } from 'react';
import { 
  SavedWorkout, 
  WorkoutHistoryFilters, 
  WorkoutHistoryResponse,
  UpdateWorkoutRequest,
  WORKOUTS_PER_PAGE 
} from '../types/workoutHistory';
import { useAuth } from './useAuth';

interface UseWorkoutHistoryResult {
  workouts: SavedWorkout[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  updateWorkout: (id: string, updates: Omit<UpdateWorkoutRequest, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
}

export const useWorkoutHistory = (filters?: WorkoutHistoryFilters): UseWorkoutHistoryResult => {
  const { isAuthenticated } = useAuth();
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchWorkouts = useCallback(async (reset: boolean = false) => {
    if (!isAuthenticated) {
      setWorkouts([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const searchParams = new URLSearchParams();
      
      searchParams.append('limit', (filters?.limit || WORKOUTS_PER_PAGE).toString());
      searchParams.append('offset', currentOffset.toString());

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
      
      if (reset) {
        setWorkouts(data.workouts);
        setOffset(data.workouts.length);
      } else {
        setWorkouts(prev => [...prev, ...data.workouts]);
        setOffset(prev => prev + data.workouts.length);
      }
      
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);

    } catch (err) {
      console.error('Error fetching workout history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout history');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters, offset]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchWorkouts(false);
    }
  }, [isLoading, hasMore, fetchWorkouts]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchWorkouts(true);
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
      setOffset(0);
      fetchWorkouts(true);
    }
  }, [isAuthenticated, filters]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setWorkouts([]);
      setError(null);
      setHasMore(false);
      setTotalCount(0);
      setOffset(0);
    }
  }, [isAuthenticated]);

  return {
    workouts,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    updateWorkout,
    deleteWorkout,
  };
};