import React from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export type WorkoutLengthOption = "short" | "medium" | "long" | "custom";

interface WorkoutLengthProps {
  selectedLength: WorkoutLengthOption;
  customMinutes: number;
  onLengthChange: (length: WorkoutLengthOption) => void;
  onCustomMinutesChange: (minutes: number) => void;
}

const WORKOUT_LENGTH_OPTIONS = [
  {
    value: "short" as const,
    label: "Short (5-12 min)",
    description: "Quick, intense workouts",
  },
  {
    value: "medium" as const,
    label: "Medium (15-25 min)",
    description: "Classic CrossFit length",
  },
  {
    value: "long" as const,
    label: "Long (30-45 min)",
    description: "Endurance focused",
  },
  {
    value: "custom" as const,
    label: "Custom",
    description: "Set your own duration",
  },
];

const WorkoutLength: React.FunctionComponent<WorkoutLengthProps> = ({
  selectedLength,
  customMinutes,
  onLengthChange,
  onCustomMinutesChange,
}) => {
  const handleCustomMinutesChange = (delta: number) => {
    const newMinutes = Math.max(5, Math.min(60, customMinutes + delta));
    onCustomMinutesChange(newMinutes);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {WORKOUT_LENGTH_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            className={cn(
              "h-auto p-3 flex flex-col items-start text-left",
              selectedLength === option.value && "bg-primary/10 border-primary",
            )}
            onClick={() => onLengthChange(option.value)}
          >
            <span className="font-medium text-sm">{option.label}</span>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </Button>
        ))}
      </div>

      {selectedLength === "custom" && (
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(-5)}
            disabled={customMinutes <= 5}
          >
            -5
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(-1)}
            disabled={customMinutes <= 5}
          >
            -1
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{customMinutes}</span>
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(1)}
            disabled={customMinutes >= 60}
          >
            +1
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(5)}
            disabled={customMinutes >= 60}
          >
            +5
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutLength;
