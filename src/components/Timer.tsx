import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useTimer, TimerType } from '@/hooks/useTimer';

interface TimerProps {
  type: TimerType;
  initialMinutes: number;
  intervalMinutes?: number;
  onFinish?: () => void;
  className?: string;
  workoutText?: string;
}

export const Timer: React.FC<TimerProps> = ({
  type,
  initialMinutes,
  intervalMinutes = 1,
  onFinish,
  className = '',
  workoutText = ''
}) => {
  const timer = useTimer({
    type,
    initialMinutes,
    intervalMinutes,
    onFinish
  });

  // Parse workout movements for each round/set
  const parseWorkoutMovements = () => {
    if (!workoutText || type !== 'interval') return [];
    
    const movements = [];
    
    if (intervalMinutes === 1) {
      // EMOM: Look for numbered movements (1., 2., 3., etc.)
      const lines = workoutText.split('\n');
      for (const line of lines) {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          const roundNum = parseInt(match[1]);
          const movement = match[2].trim();
          movements[roundNum - 1] = movement;
        }
      }
    } else {
      // Interval workouts: Extract the set description
      // Look for patterns like "3 minutes:" or "Set 1:" or just the movement list
      const lines = workoutText.split('\n').filter(line => line.trim());
      let currentMovement = '';
      
      for (const line of lines) {
        // Skip headers and timing info
        if (line.includes('Set') && line.includes('every') && line.includes('minute')) continue;
        if (line.includes('Minute') && line.includes('EMOM')) continue;
        if (line.includes('AMRAP')) continue;
        if (line.includes('For Time')) continue;
        
        // Look for movement descriptions
        if (line.includes('Cal ') || line.includes('Rep') || 
            line.match(/\d+\s+([\w\s]+)/) || line.includes('-')) {
          if (currentMovement) currentMovement += ', ';
          currentMovement += line.trim();
        }
      }
      
      // For intervals, all sets typically have the same movements
      if (currentMovement) {
        const totalSets = Math.ceil(initialMinutes / intervalMinutes);
        for (let i = 0; i < totalSets; i++) {
          movements[i] = currentMovement;
        }
      }
    }
    
    return movements;
  };

  const workoutMovements = parseWorkoutMovements();

  // Get current movement based on timer position
  const getCurrentMovement = () => {
    if (type !== 'interval' || workoutMovements.length === 0) return '';
    
    const currentInterval = timer.getCurrentInterval();
    const movementIndex = currentInterval - 1;
    
    if (intervalMinutes === 1) {
      // EMOM: cycle through movements
      const movement = workoutMovements[movementIndex % workoutMovements.length];
      return movement || '';
    } else {
      // Interval workouts: show movement for current set
      return workoutMovements[movementIndex] || workoutMovements[0] || '';
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        timer.toggle();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        timer.reset();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [timer]);

  const getTimerColor = () => {
    if (timer.isFinished) return 'text-red-500';
    if (!timer.isRunning) return 'text-gray-500';
    
    if (type === 'countdown') {
      const percentage = timer.getProgressPercentage();
      if (percentage > 80) return 'text-red-500';
      if (percentage > 60) return 'text-yellow-500';
      return 'text-green-500';
    }
    
    return 'text-blue-500';
  };

  const getBackgroundColor = () => {
    if (timer.isFinished) return 'bg-red-50 dark:bg-red-900/20';
    if (!timer.isRunning) return 'bg-gray-50 dark:bg-gray-800/50';
    return 'bg-blue-50 dark:bg-blue-900/20';
  };

  const formatTime = () => {
    const mins = timer.minutes.toString().padStart(2, '0');
    const secs = timer.seconds.toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getTimerLabel = () => {
    if (type === 'interval') {
      const currentInterval = timer.getCurrentInterval();
      
      if (intervalMinutes === 1) {
        // EMOM: Show rounds (minutes)
        const totalIntervals = initialMinutes;
        return `Round ${currentInterval}/${totalIntervals}`;
      } else {
        // Other intervals: Show sets
        const totalSets = Math.ceil(initialMinutes / intervalMinutes);
        return `Set ${currentInterval}/${totalSets}`;
      }
    }
    if (type === 'countdown') return 'Time Remaining';
    return 'Elapsed Time';
  };

  const getProgressPercentage = () => {
    if (type === 'countup') return 0; // No progress bar for count-up
    return timer.getProgressPercentage();
  };

  return (
    <div className={`flex flex-col items-center space-y-4 p-6 rounded-lg ${getBackgroundColor()} ${className}`}>
      {/* Timer Label */}
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {getTimerLabel()}
      </div>

      {/* Timer Display */}
      <div className={`text-6xl font-mono font-bold ${getTimerColor()}`}>
        {formatTime()}
      </div>

      {/* Current Movement */}
      {type === 'interval' && getCurrentMovement() && (
        <div className="w-full max-w-md text-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getCurrentMovement()}
          </div>
        </div>
      )}

      {/* Progress Bar (only for countdown and interval timers) */}
      {type !== 'countup' && (
        <div className="w-full max-w-md h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timer.isFinished 
                ? 'bg-red-500' 
                : timer.isRunning 
                  ? 'bg-blue-500' 
                  : 'bg-gray-400'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex space-x-3">
        <Button
          onClick={timer.toggle}
          variant={timer.isRunning ? "secondary" : "default"}
          size="lg"
          className="flex items-center space-x-2"
          disabled={timer.isFinished && type === 'countdown'}
        >
          {timer.isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Start</span>
            </>
          )}
        </Button>

        <Button
          onClick={timer.reset}
          variant="outline"
          size="lg"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Status Messages */}
      {timer.isFinished && (
        <div className="text-center">
          {type === 'countdown' && (
            <div className="text-red-600 dark:text-red-400 font-semibold">
              Time's Up! 🔥
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Help - Hidden on mobile */}
      <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to start/pause, 
        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded ml-1">R</kbd> to reset
      </div>
    </div>
  );
};