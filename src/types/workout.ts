import { WorkoutFormat } from '@/components/SpecificFormatSelector';

export type TimerType = 'countdown' | 'countup' | 'interval' | 'none';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TimingSource = 'ai' | 'parsed' | 'default';

export interface WorkoutIntervals {
  work: number;        // Work period in minutes
  rest: number;        // Rest period in minutes
  rounds: number;      // Number of intervals
}

export interface WorkoutTiming {
  type: TimerType;
  duration: number;              // Total duration in minutes (0 for unlimited)
  intervals?: WorkoutIntervals;  // Only for interval-type workouts
  timeCapMinutes?: number;       // Maximum time allowed (for countup timers)
  description: string;           // Human-readable timing description
}

export interface WorkoutContent {
  text: string;              // The workout description for display
  format: WorkoutFormat;     // Validated format type
  difficulty: DifficultyLevel;
}

export interface WorkoutMetadata {
  movements: string[];       // List of movements used in the workout
  estimatedCalories?: number; // Estimated calories burned
  equipment?: string[];      // Required equipment
  scalingOptions?: string[]; // Suggested scaling modifications
}

export interface WorkoutSystemInfo {
  generated: string;         // ISO timestamp of generation
  version: string;           // Schema version for compatibility
  source: TimingSource;      // How timing was determined
  confidence: number;        // 0-1 confidence score
}

export interface WorkoutResponse {
  workout: WorkoutContent;
  timing: WorkoutTiming;
  metadata: WorkoutMetadata;
  system: WorkoutSystemInfo;
}

// Legacy type for backward compatibility
export type LegacyWorkoutData = string;

// Union type for transition period
export type WorkoutData = LegacyWorkoutData | WorkoutResponse;

// Type guards for runtime checking
export function isStructuredWorkout(data: WorkoutData): data is WorkoutResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'workout' in data &&
    'timing' in data &&
    'metadata' in data &&
    'system' in data
  );
}

export function isLegacyWorkout(data: WorkoutData): data is LegacyWorkoutData {
  return typeof data === 'string';
}

// Validation helpers
export function isValidTimerType(type: string): type is TimerType {
  return ['countdown', 'countup', 'interval', 'none'].includes(type);
}

export function isValidDifficulty(difficulty: string): difficulty is DifficultyLevel {
  return ['beginner', 'intermediate', 'advanced'].includes(difficulty);
}

export function isValidTimingSource(source: string): source is TimingSource {
  return ['ai', 'parsed', 'default'].includes(source);
}

// Default values
export const DEFAULT_WORKOUT_TIMING: WorkoutTiming = {
  type: 'countdown',
  duration: 20,
  description: '20-Minute Timer'
};

export const CURRENT_SCHEMA_VERSION = '1.0.0';

// Format-specific timing validation
export function validateTimingForFormat(timing: WorkoutTiming, format: WorkoutFormat): boolean {
  switch (format) {
    case 'amrap':
      return timing.type === 'countdown' && timing.duration > 0 && timing.duration <= 60;
    
    case 'emom':
      return (
        timing.type === 'interval' &&
        timing.intervals !== undefined &&
        timing.intervals.work === 1 &&
        timing.intervals.rest === 0 &&
        timing.duration > 0
      );
    
    case 'for_time':
      return timing.type === 'countup';
    
    case 'intervals':
      return (
        timing.type === 'interval' &&
        timing.intervals !== undefined &&
        timing.intervals.work > 0 &&
        timing.intervals.rounds > 0
      );
    
    case 'chipper':
      return timing.type === 'countup';
    
    case 'strength_metcon':
      // Can be either countdown (for metcon portion) or none (for strength portion)
      return timing.type === 'countdown' || timing.type === 'none';
    
    default:
      return true; // Allow any timing for unknown formats
  }
}

// Quality scoring for timing data
export function calculateTimingConfidence(
  timing: WorkoutTiming, 
  format: WorkoutFormat, 
  source: TimingSource
): number {
  let confidence = 0.5; // Base confidence
  
  // Source-based confidence
  switch (source) {
    case 'ai':
      confidence = 0.9;
      break;
    case 'parsed':
      confidence = 0.7;
      break;
    case 'default':
      confidence = 0.5;
      break;
  }
  
  // Format validation bonus
  if (validateTimingForFormat(timing, format)) {
    confidence += 0.1;
  }
  
  // Reasonable duration bonus
  if (timing.duration > 0 && timing.duration <= 60) {
    confidence += 0.05;
  }
  
  // Description quality bonus
  if (timing.description && timing.description.length > 5) {
    confidence += 0.05;
  }
  
  return Math.min(confidence, 1.0);
}