import { FormatType } from "@/components/FormatSelector";
import { WorkoutFormat } from "@/components/SpecificFormatSelector";
import { WeightUnit } from "@/components/UnitSelector";
import { WorkoutLengthOption } from "@/components/WorkoutLength";
import { WorkoutIntent } from "@/components/WorkoutIntent";
import { useState } from "react";
import { 
  WorkoutData, 
  WorkoutTiming,
  isStructuredWorkout,
  isLegacyWorkout
} from "@/types/workout";
import { parseWorkoutTiming } from "@/utils/workoutParser";
import { createDefaultWorkoutResponse } from "@/utils/workoutValidation";

interface UseWodResult {
  wod: string | null;
  timing: WorkoutTiming | null;
  confidence: number;
  source: 'ai' | 'parsed' | 'default';
  isLoading: boolean;
  error: string | null;
}

export const useGenerateWod = (): [
  (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    workoutFormat: WorkoutFormat | undefined,
    weightUnit: WeightUnit,
    workoutLength: WorkoutLengthOption,
    customMinutes: number,
    workoutIntent: WorkoutIntent,
  ) => void,
  UseWodResult,
] => {
  const [wod, setWod] = useState<string | null>(null);
  const [timing, setTiming] = useState<WorkoutTiming | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [source, setSource] = useState<'ai' | 'parsed' | 'default'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchWod = async (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    workoutFormat: WorkoutFormat | undefined,
    weightUnit: WeightUnit,
    workoutLength: WorkoutLengthOption,
    customMinutes: number,
    workoutIntent: WorkoutIntent,
  ) => {
    setIsLoading(true);
    setError(null);
    
    const requestBody = {
      random: random,
      exercises: exercises,
      formatType: formatType,
      workoutFormat: workoutFormat || 'amrap',
      weightUnit: weightUnit,
      workoutLength: workoutLength,
      customMinutes: customMinutes,
      workoutIntent: workoutIntent,
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
        
        console.log('✅ Received structured workout response:', {
          format: data.workout.format,
          timing: data.timing.type,
          source: data.system.source,
          confidence: data.system.confidence
        });
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
      error
    }
  ];
};
