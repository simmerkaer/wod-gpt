import { WorkoutFormat } from '@/components/SpecificFormatSelector';

export interface WorkoutTiming {
  minutes: number;
  type: 'countdown' | 'countup' | 'interval';
  intervalMinutes?: number;
  description: string;
}

export const parseWorkoutTiming = (workoutText: string, workoutFormat: WorkoutFormat): WorkoutTiming => {
  const text = workoutText.toLowerCase();
  
  // Default timings for each format
  const defaults: Record<WorkoutFormat, WorkoutTiming> = {
    amrap: { minutes: 20, type: 'countdown', description: '20-Minute AMRAP' },
    emom: { minutes: 15, type: 'interval', intervalMinutes: 1, description: '15-Minute EMOM' },
    for_time: { minutes: 0, type: 'countup', description: 'For Time' },
    intervals: { minutes: 20, type: 'interval', intervalMinutes: 2, description: '20-Minute Intervals' },
    chipper: { minutes: 0, type: 'countup', description: 'Chipper For Time' },
    strength_metcon: { minutes: 15, type: 'countdown', description: '15-Minute MetCon' }
  };

  // Try to extract timing from workout text
  const patterns = {
    // AMRAP patterns: "20-minute AMRAP", "AMRAP 20", "20 min AMRAP"
    amrap: /(?:(\d+)[\s-]*min(?:ute)?s?\s+amrap|amrap\s+(\d+))/i,
    
    // EMOM patterns: "15-minute EMOM", "EMOM 15", "Every minute for 15 minutes"
    emom: /(?:(\d+)[\s-]*min(?:ute)?s?\s+emom|emom\s+(\d+)|every\s+minute\s+for\s+(\d+)\s+min)/i,
    
    // Time cap patterns: "15 minute time cap", "time cap: 15 min"
    timeCap: /(?:(\d+)[\s-]*min(?:ute)?s?\s+time\s+cap|time\s+cap:?\s*(\d+)\s*min)/i,
    
    // Interval patterns: "4 rounds every 3 minutes", "every 2 minutes for 20 minutes"
    intervals: /(?:every\s+(\d+)\s+min(?:ute)?s?\s+for\s+(\d+)\s+min|(\d+)\s+rounds\s+every\s+(\d+)\s+min)/i,
    
    // General minute patterns: "in 20 minutes", "20 minutes to complete"
    generalTime: /(?:in\s+(\d+)\s+min(?:ute)?s?|(\d+)\s+min(?:ute)?s?\s+to\s+complete)/i
  };

  let extractedTiming: WorkoutTiming | null = null;

  // Check format-specific patterns
  if (workoutFormat === 'amrap') {
    const match = text.match(patterns.amrap);
    if (match) {
      const minutes = parseInt(match[1] || match[2]);
      if (minutes > 0) {
        extractedTiming = {
          minutes,
          type: 'countdown',
          description: `${minutes}-Minute AMRAP`
        };
      }
    }
  } else if (workoutFormat === 'emom') {
    const match = text.match(patterns.emom);
    if (match) {
      const minutes = parseInt(match[1] || match[2] || match[3]);
      if (minutes > 0) {
        extractedTiming = {
          minutes,
          type: 'interval',
          intervalMinutes: 1,
          description: `${minutes}-Minute EMOM`
        };
      }
    }
  } else if (workoutFormat === 'intervals') {
    const match = text.match(patterns.intervals);
    if (match) {
      if (match[1] && match[2]) {
        // "every X minutes for Y minutes"
        const intervalMins = parseInt(match[1]);
        const totalMins = parseInt(match[2]);
        extractedTiming = {
          minutes: totalMins,
          type: 'interval',
          intervalMinutes: intervalMins,
          description: `${totalMins}-Minute Intervals (Every ${intervalMins} min)`
        };
      } else if (match[3] && match[4]) {
        // "X rounds every Y minutes"
        const rounds = parseInt(match[3]);
        const intervalMins = parseInt(match[4]);
        const totalMins = rounds * intervalMins;
        extractedTiming = {
          minutes: totalMins,
          type: 'interval',
          intervalMinutes: intervalMins,
          description: `${rounds} Rounds Every ${intervalMins} Minutes`
        };
      }
    }
  }

  // Check for time cap (applies to for_time, chipper, etc.)
  if (!extractedTiming && (workoutFormat === 'for_time' || workoutFormat === 'chipper')) {
    const match = text.match(patterns.timeCap);
    if (match) {
      const minutes = parseInt(match[1] || match[2]);
      if (minutes > 0) {
        extractedTiming = {
          minutes,
          type: 'countdown',
          description: `${minutes}-Minute Time Cap`
        };
      }
    }
  }

  // Check for general time patterns as fallback
  if (!extractedTiming) {
    const match = text.match(patterns.generalTime);
    if (match) {
      const minutes = parseInt(match[1] || match[2]);
      if (minutes > 0) {
        const type = workoutFormat === 'for_time' || workoutFormat === 'chipper' ? 'countup' : 'countdown';
        extractedTiming = {
          minutes,
          type,
          description: `${minutes}-Minute ${type === 'countdown' ? 'Timer' : 'Time Cap'}`
        };
      }
    }
  }

  // Return extracted timing or default
  return extractedTiming || defaults[workoutFormat];
};

export const getTimerType = (workoutFormat: WorkoutFormat): 'countdown' | 'countup' | 'interval' => {
  switch (workoutFormat) {
    case 'amrap':
      return 'countdown';
    case 'emom':
    case 'intervals':
      return 'interval';
    case 'for_time':
    case 'chipper':
      return 'countup';
    case 'strength_metcon':
      return 'countdown';
    default:
      return 'countdown';
  }
};

export const getDefaultMinutes = (workoutFormat: WorkoutFormat): number => {
  switch (workoutFormat) {
    case 'amrap':
      return 20;
    case 'emom':
      return 15;
    case 'for_time':
    case 'chipper':
      return 0; // Count up, no preset time
    case 'intervals':
      return 20;
    case 'strength_metcon':
      return 15;
    default:
      return 20;
  }
};