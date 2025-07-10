import { Dumbbell, Heart, Flame, Target, RefreshCw, BarChart3, Trophy, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type WorkoutIntent = 
  | "strength"
  | "endurance" 
  | "fat_loss"
  | "skill_development"
  | "recovery"
  | "general_fitness"
  | "competition_prep";

interface WorkoutIntentSelectorProps {
  value: WorkoutIntent;
  onValueChange: (value: WorkoutIntent) => void;
}

export const WORKOUT_INTENTS = [
  {
    value: "strength" as WorkoutIntent,
    label: "Strength",
    description: "Build muscle & power",
    icon: Dumbbell,
    color: "text-red-600"
  },
  {
    value: "endurance" as WorkoutIntent,
    label: "Endurance", 
    description: "Cardio & conditioning",
    icon: Heart,
    color: "text-blue-600"
  },
  {
    value: "fat_loss" as WorkoutIntent,
    label: "Fat Loss",
    description: "HIIT & calorie burn",
    icon: Flame,
    color: "text-orange-600"
  },
  {
    value: "skill_development" as WorkoutIntent,
    label: "Skill",
    description: "Technique & coordination",
    icon: Target,
    color: "text-purple-600"
  },
  {
    value: "recovery" as WorkoutIntent,
    label: "Recovery",
    description: "Active rest & mobility",
    icon: RefreshCw,
    color: "text-green-600"
  },
  {
    value: "general_fitness" as WorkoutIntent,
    label: "General",
    description: "Balanced conditioning",
    icon: BarChart3,
    color: "text-gray-600"
  },
  {
    value: "competition_prep" as WorkoutIntent,
    label: "Competition",
    description: "Sport-specific training",
    icon: Trophy,
    color: "text-yellow-600"
  }
] as const;

const WorkoutIntentSelector: React.FunctionComponent<WorkoutIntentSelectorProps> = ({
  value,
  onValueChange,
}) => {
  const selectedIntent = WORKOUT_INTENTS.find(intent => intent.value === value);
  const SelectedIcon = selectedIntent?.icon || Target;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className={`h-4 w-4 ${selectedIntent?.color || 'text-gray-600'}`} />
            <span>{selectedIntent?.label || "Select intent"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {WORKOUT_INTENTS.map((intent) => {
          const IconComponent = intent.icon;
          return (
            <DropdownMenuItem 
              key={intent.value} 
              onClick={() => onValueChange(intent.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconComponent className={`h-4 w-4 ${intent.color}`} />
              <div className="flex flex-col">
                <div className="font-medium">{intent.label}</div>
                <div className="text-xs text-muted-foreground">{intent.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkoutIntentSelector;