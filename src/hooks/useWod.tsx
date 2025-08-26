import { FormatType } from "@/components/FormatSelector";
import { WeightUnit } from "@/components/UnitSelector";
import { WorkoutLengthOption } from "@/components/WorkoutLength";
import { WorkoutIntent } from "@/components/WorkoutIntent";
import { MovementUsageMode } from "@/lib/movementId";
import { useState } from "react";
import { 
  WorkoutData, 
  WorkoutTiming,
  isStructuredWorkout,
  isLegacyWorkout,
  WorkoutResponse
} from "@/types/workout";
import { parseWorkoutTiming } from "@/utils/workoutParser";
import { createDefaultWorkoutResponse } from "@/utils/workoutValidation";
import { useSaveWorkout } from "./useSaveWorkout";
import { useAuth } from "./useAuth";
import { useWorkoutHistory } from "./useWorkoutHistory";

interface UseWodResult {
  wod: string | null;
  timing: WorkoutTiming | null;
  confidence: number;
  source: 'ai' | 'parsed' | 'default';
  isLoading: boolean;
  error: string | null;
  workoutResponse: WorkoutResponse | null;
  savedWorkoutId: string | null;
  isFavorite: boolean;
  toggleFavorite: () => Promise<void>;
}

export const useGenerateWod = (): [
  (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    weightUnit: WeightUnit,
    workoutLength: WorkoutLengthOption,
    customMinutes: number,
    workoutIntent: WorkoutIntent,
    movementUsageMode: MovementUsageMode,
  ) => void,
  UseWodResult,
] => {
  const [wod, setWod] = useState<string | null>(null);
  const [timing, setTiming] = useState<WorkoutTiming | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [source, setSource] = useState<'ai' | 'parsed' | 'default'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutResponse, setWorkoutResponse] = useState<WorkoutResponse | null>(null);
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  const { isAuthenticated } = useAuth();
  const { saveWorkout } = useSaveWorkout();
  const { updateWorkout } = useWorkoutHistory();

  // Toggle favorite status for the current workout
  const toggleFavorite = async () => {
    if (!savedWorkoutId || !isAuthenticated) {
      throw new Error('Workout must be saved and user must be authenticated to toggle favorite');
    }
    
    try {
      const newFavoriteStatus = !isFavorite;
      await updateWorkout(savedWorkoutId, { favorite: newFavoriteStatus });
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };
  const fetchWod = async (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    weightUnit: WeightUnit,
    workoutLength: WorkoutLengthOption,
    customMinutes: number,
    workoutIntent: WorkoutIntent,
    movementUsageMode: MovementUsageMode,
  ) => {
    setIsLoading(true);
    setError(null);
    // Reset workout state when generating new workout
    setSavedWorkoutId(null);
    setIsFavorite(false);
    
    const requestBody = {
      random: random,
      exercises: exercises,
      formatType: formatType === "random" ? "random" : "specific",
      workoutFormat: formatType === "random" ? 'amrap' : formatType,
      weightUnit: weightUnit,
      workoutLength: workoutLength,
      customMinutes: customMinutes,
      workoutIntent: workoutIntent,
      movementUsageMode: movementUsageMode,
    };

    // Auto-save workout if user is authenticated
    const autoSaveWorkout = async (workoutData: WorkoutResponse) => {
      if (isAuthenticated && workoutData) {
        try {
          console.log('🔄 Auto-saving workout for authenticated user...');
          const workoutId = await saveWorkout(workoutData, {
            completedAt: new Date().toISOString(),
          });
          setSavedWorkoutId(workoutId);
          console.log('✅ Workout auto-saved with ID:', workoutId);
        } catch (error) {
          console.error('❌ Failed to auto-save workout:', error);
          // Don't fail the whole generation if auto-save fails
        }
      }
    };

    try {
      const response = await fetch("/api/generateWod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WorkoutData = await response.json();
      
      // Handle structured response (new format)
      if (isStructuredWorkout(data)) {
        setWod(data.workout.text);
        setTiming(data.timing);
        setConfidence(data.system.confidence);
        setSource(data.system.source);
        setWorkoutResponse(data);
        
        console.log('✅ Received structured workout response:', {
          format: data.workout.format,
          timing: data.timing.type,
          source: data.system.source,
          confidence: data.system.confidence
        });
        
        // Auto-save the workout
        await autoSaveWorkout(data);
      }
      // Handle legacy response (old format) - backward compatibility
      else if (isLegacyWorkout(data)) {
        setWod(data);
        
        // Parse timing from text as fallback
        const parsedTiming = parseWorkoutTiming(data, requestBody.workoutFormat);
        setTiming({
          type: parsedTiming.type as 'countdown' | 'countup' | 'interval' | 'none',
          duration: parsedTiming.minutes,
          intervals: parsedTiming.intervalMinutes ? {
            work: parsedTiming.intervalMinutes,
            rest: 0,
            rounds: Math.ceil(parsedTiming.minutes / parsedTiming.intervalMinutes)
          } : undefined,
          description: parsedTiming.description
        });
        setConfidence(0.6); // Lower confidence for parsed timing
        setSource('parsed');
        setWorkoutResponse(null); // Legacy format doesn't have full structure
        
        console.log('⚠️ Received legacy workout response, parsed timing:', parsedTiming);
      }
      // Handle unexpected response format
      else {
        console.error('❌ Unexpected response format:', data);
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      console.error("Error fetching WOD data:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Fallback to default workout on error
      const defaultResponse = createDefaultWorkoutResponse(
        requestBody.workoutFormat,
        'Error generating workout - using default'
      );
      
      setWod(defaultResponse.workout.text);
      setTiming(defaultResponse.timing);
      setConfidence(defaultResponse.system.confidence);
      setSource(defaultResponse.system.source);
      setWorkoutResponse(defaultResponse);
      
      // Auto-save the default workout
      await autoSaveWorkout(defaultResponse);
      
    } finally {
      setIsLoading(false);
    }
  };

  return [
    fetchWod,
    {
      wod,
      timing,
      confidence,
      source,
      isLoading,
      error,
      workoutResponse,
      savedWorkoutId,
      isFavorite,
      toggleFavorite
    }
  ];
};
