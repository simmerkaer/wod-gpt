import React from "react";
import { Button } from "./ui/button";
import { ChevronDown, Clock, Minus, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

  const selectedOption = WORKOUT_LENGTH_OPTIONS.find(option => option.value === selectedLength);
  const displayLabel = selectedLength === "custom" 
    ? `Custom (${customMinutes} min)` 
    : selectedOption?.label || "Select length";

  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{displayLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {WORKOUT_LENGTH_OPTIONS.map((option) => (
            <DropdownMenuItem 
              key={option.value} 
              onClick={() => onLengthChange(option.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="flex flex-col">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedLength === "custom" && (
        <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(-5)}
            disabled={customMinutes <= 5}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(-1)}
            disabled={customMinutes <= 5}
            className="h-8 w-8 p-0"
          >
            -1
          </Button>

          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-xl font-bold">{customMinutes}</span>
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(1)}
            disabled={customMinutes >= 60}
            className="h-8 w-8 p-0"
          >
            +1
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCustomMinutesChange(5)}
            disabled={customMinutes >= 60}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutLength;
