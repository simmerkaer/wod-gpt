import { 
  WorkoutResponse, 
  WorkoutTiming, 
  WorkoutContent, 
  WorkoutMetadata,
  WorkoutSystemInfo,
  isValidTimerType,
  isValidDifficulty,
  validateTimingForFormat,
  calculateTimingConfidence,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_WORKOUT_TIMING
} from '@/types/workout';
import { WorkoutFormat } from '@/components/SpecificFormatSelector';

// JSON Schema for OpenAI structured outputs
export const WORKOUT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    workout: {
      type: "object",
      properties: {
        text: { type: "string", minLength: 10 },
        format: { 
          type: "string", 
          enum: ["amrap", "emom", "for_time", "intervals", "chipper", "strength_metcon"] 
        },
        difficulty: { 
          type: "string", 
          enum: ["beginner", "intermediate", "advanced"] 
        }
      },
      required: ["text", "format", "difficulty"],
      additionalProperties: false
    },
    timing: {
      type: "object",
      properties: {
        type: { 
          type: "string", 
          enum: ["countdown", "countup", "interval", "none"] 
        },
        duration: { type: "number", minimum: 0, maximum: 120 },
        intervals: {
          type: "object",
          properties: {
            work: { type: "number", minimum: 0.25, maximum: 30 },
            rest: { type: "number", minimum: 0, maximum: 30 },
            rounds: { type: "integer", minimum: 1, maximum: 50 }
          },
          required: ["work", "rest", "rounds"],
          additionalProperties: false
        },
        timeCapMinutes: { type: "number", minimum: 1, maximum: 120 },
        description: { type: "string", minLength: 5, maxLength: 100 }
      },
      required: ["type", "duration", "description"],
      additionalProperties: false
    },
    metadata: {
      type: "object",
      properties: {
        movements: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 20
        },
        estimatedCalories: { type: "number", minimum: 50, maximum: 2000 },
        equipment: {
          type: "array",
          items: { type: "string" },
          maxItems: 15
        },
        scalingOptions: {
          type: "array",
          items: { type: "string" },
          maxItems: 10
        }
      },
      required: ["movements"],
      additionalProperties: false
    }
  },
  required: ["workout", "timing", "metadata"],
  additionalProperties: false
} as const;

/**
 * Validates a complete WorkoutResponse object
 */
export function validateWorkoutResponse(data: unknown): data is WorkoutResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const response = data as any;

  // Validate top-level structure
  if (!response.workout || !response.timing || !response.metadata) {
    return false;
  }

  // Validate workout content
  if (!validateWorkoutContent(response.workout)) {
    return false;
  }

  // Validate timing
  if (!validateWorkoutTiming(response.timing)) {
    return false;
  }

  // Validate metadata
  if (!validateWorkoutMetadata(response.metadata)) {
    return false;
  }

  // Cross-validation: timing should match format
  if (!validateTimingForFormat(response.timing, response.workout.format)) {
    return false;
  }

  return true;
}

/**
 * Validates workout content section
 */
export function validateWorkoutContent(content: unknown): content is WorkoutContent {
  if (!content || typeof content !== 'object') {
    return false;
  }

  const workout = content as any;

  // Check required fields
  if (!workout.text || typeof workout.text !== 'string' || workout.text.length < 10) {
    return false;
  }

  if (!workout.format || !isValidWorkoutFormat(workout.format)) {
    return false;
  }

  if (!workout.difficulty || !isValidDifficulty(workout.difficulty)) {
    return false;
  }

  return true;
}

/**
 * Validates timing section
 */
export function validateWorkoutTiming(timing: unknown): timing is WorkoutTiming {
  if (!timing || typeof timing !== 'object') {
    return false;
  }

  const timingData = timing as any;

  // Check required fields
  if (!timingData.type || !isValidTimerType(timingData.type)) {
    return false;
  }

  if (typeof timingData.duration !== 'number' || timingData.duration < 0 || timingData.duration > 120) {
    return false;
  }

  if (!timingData.description || typeof timingData.description !== 'string' || timingData.description.length < 5) {
    return false;
  }

  // Validate intervals if present
  if (timingData.intervals) {
    if (!validateWorkoutIntervals(timingData.intervals)) {
      return false;
    }
  }

  // Validate timeCap if present
  if (timingData.timeCapMinutes !== undefined) {
    if (typeof timingData.timeCapMinutes !== 'number' || 
        timingData.timeCapMinutes < 1 || 
        timingData.timeCapMinutes > 120) {
      return false;
    }
  }

  return true;
}

/**
 * Validates workout intervals
 */
function validateWorkoutIntervals(intervals: unknown): boolean {
  if (!intervals || typeof intervals !== 'object') {
    return false;
  }

  const intervalData = intervals as any;

  if (typeof intervalData.work !== 'number' || 
      intervalData.work < 0.25 || 
      intervalData.work > 30) {
    return false;
  }

  if (typeof intervalData.rest !== 'number' || 
      intervalData.rest < 0 || 
      intervalData.rest > 30) {
    return false;
  }

  if (!Number.isInteger(intervalData.rounds) || 
      intervalData.rounds < 1 || 
      intervalData.rounds > 50) {
    return false;
  }

  return true;
}

/**
 * Validates metadata section
 */
export function validateWorkoutMetadata(metadata: unknown): metadata is WorkoutMetadata {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const metadataObj = metadata as any;

  // Check required movements array
  if (!Array.isArray(metadataObj.movements) || 
      metadataObj.movements.length === 0 ||
      metadataObj.movements.length > 20) {
    return false;
  }

  // Validate all movements are strings
  if (!metadataObj.movements.every((movement: unknown) => typeof movement === 'string')) {
    return false;
  }

  // Validate optional fields
  if (metadataObj.estimatedCalories !== undefined) {
    if (typeof metadataObj.estimatedCalories !== 'number' || 
        metadataObj.estimatedCalories < 50 || 
        metadataObj.estimatedCalories > 2000) {
      return false;
    }
  }

  if (metadataObj.equipment !== undefined) {
    if (!Array.isArray(metadataObj.equipment) || metadataObj.equipment.length > 15) {
      return false;
    }
    if (!metadataObj.equipment.every((item: unknown) => typeof item === 'string')) {
      return false;
    }
  }

  if (metadataObj.scalingOptions !== undefined) {
    if (!Array.isArray(metadataObj.scalingOptions) || metadataObj.scalingOptions.length > 10) {
      return false;
    }
    if (!metadataObj.scalingOptions.every((option: unknown) => typeof option === 'string')) {
      return false;
    }
  }

  return true;
}

/**
 * Validates workout format
 */
function isValidWorkoutFormat(format: string): format is WorkoutFormat {
  return ['amrap', 'emom', 'for_time', 'intervals', 'chipper', 'strength_metcon'].includes(format);
}

/**
 * Attempts to repair a malformed workout response
 */
export function repairWorkoutResponse(data: unknown, format: WorkoutFormat): WorkoutResponse | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as any;

  try {
    // Attempt to repair workout content
    const workout: WorkoutContent = {
      text: typeof response.workout?.text === 'string' ? response.workout.text : 'Workout unavailable',
      format: isValidWorkoutFormat(response.workout?.format) ? response.workout.format : format,
      difficulty: isValidDifficulty(response.workout?.difficulty) ? response.workout.difficulty : 'intermediate'
    };

    // Attempt to repair timing
    let timing: WorkoutTiming;
    if (validateWorkoutTiming(response.timing)) {
      timing = response.timing;
    } else {
      timing = generateDefaultTiming(format);
    }

    // Attempt to repair metadata
    const metadata: WorkoutMetadata = {
      movements: Array.isArray(response.metadata?.movements) ? 
        response.metadata.movements.filter((m: unknown) => typeof m === 'string') : 
        ['unknown'],
      estimatedCalories: typeof response.metadata?.estimatedCalories === 'number' ? 
        response.metadata.estimatedCalories : undefined,
      equipment: Array.isArray(response.metadata?.equipment) ? 
        response.metadata.equipment.filter((e: unknown) => typeof e === 'string') : undefined,
      scalingOptions: Array.isArray(response.metadata?.scalingOptions) ? 
        response.metadata.scalingOptions.filter((s: unknown) => typeof s === 'string') : undefined
    };

    // Create system info
    const system: WorkoutSystemInfo = {
      generated: new Date().toISOString(),
      version: CURRENT_SCHEMA_VERSION,
      source: 'parsed', // Marked as parsed since we had to repair it
      confidence: calculateTimingConfidence(timing, format, 'parsed')
    };

    const repairedResponse: WorkoutResponse = {
      workout,
      timing,
      metadata,
      system
    };

    // Final validation
    if (validateWorkoutResponse(repairedResponse)) {
      return repairedResponse;
    }
  } catch (error) {
    console.warn('Failed to repair workout response:', error);
  }

  return null;
}

/**
 * Generates default timing for a workout format
 */
export function generateDefaultTiming(format: WorkoutFormat): WorkoutTiming {
  switch (format) {
    case 'amrap':
      return {
        type: 'countdown',
        duration: 20,
        description: '20-Minute AMRAP'
      };
    
    case 'emom':
      return {
        type: 'interval',
        duration: 15,
        intervals: { work: 1, rest: 0, rounds: 15 },
        description: '15-Minute EMOM'
      };
    
    case 'for_time':
      return {
        type: 'countup',
        duration: 0,
        timeCapMinutes: 15,
        description: 'For Time (15 min cap)'
      };
    
    case 'intervals':
      return {
        type: 'interval',
        duration: 20,
        intervals: { work: 3, rest: 1, rounds: 5 },
        description: '5 Rounds (3 min work, 1 min rest)'
      };
    
    case 'chipper':
      return {
        type: 'countup',
        duration: 0,
        timeCapMinutes: 25,
        description: 'Chipper For Time (25 min cap)'
      };
    
    case 'strength_metcon':
      return {
        type: 'countdown',
        duration: 15,
        description: '15-Minute MetCon'
      };
    
    default:
      return DEFAULT_WORKOUT_TIMING;
  }
}

/**
 * Creates a complete default workout response
 */
export function createDefaultWorkoutResponse(
  format: WorkoutFormat,
  workoutText?: string
): WorkoutResponse {
  const timing = generateDefaultTiming(format);
  
  return {
    workout: {
      text: workoutText || 'Default workout - please regenerate',
      format,
      difficulty: 'intermediate'
    },
    timing,
    metadata: {
      movements: ['unknown'],
      equipment: ['basic']
    },
    system: {
      generated: new Date().toISOString(),
      version: CURRENT_SCHEMA_VERSION,
      source: 'default',
      confidence: calculateTimingConfidence(timing, format, 'default')
    }
  };
}