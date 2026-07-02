import {
  Activity,
  ChevronDown,
  Dumbbell,
  Gauge,
  ListChecks,
  Repeat,
  Shuffle,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface FormatSelectorProps {
  value: string;
  onValueChange: (value: FormatType) => void;
  disabled?: boolean;
}

export type FormatType = "amrap" | "emom" | "for_time" | "intervals" | "chipper" | "strength_metcon" | "random";

const FORMAT_OPTIONS = [
  {
    value: "emom" as FormatType,
    label: "EMOM",
    description: "Every Minute on the Minute",
    icon: Timer,
    color: "text-purple-600",
  },
  {
    value: "amrap" as FormatType,
    label: "AMRAP",
    description: "As Many Rounds As Possible",
    icon: Repeat,
    color: "text-blue-600",
  },
  {
    value: "for_time" as FormatType,
    label: "For Time",
    description: "Complete as fast as possible",
    icon: Gauge,
    color: "text-orange-600",
  },
  {
    value: "intervals" as FormatType,
    label: "Intervals",
    description: "Timed work/rest periods",
    icon: Activity,
    color: "text-cyan-600",
  },
  {
    value: "chipper" as FormatType,
    label: "Chipper",
    description: "High volume, sequential",
    icon: ListChecks,
    color: "text-green-600",
  },
  {
    value: "strength_metcon" as FormatType,
    label: "Strength + MetCon",
    description: "Strength work + conditioning",
    icon: Dumbbell,
    color: "text-red-600",
  },
  {
    value: "random" as FormatType,
    label: "Random",
    description: "Surprise me",
    icon: Shuffle,
    color: "text-gray-600",
  },
] as const;

const FormatSelector: React.FunctionComponent<FormatSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const selectedFormat = FORMAT_OPTIONS.find(format => format.value === value);
  const SelectedIcon = selectedFormat?.icon || Zap;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className={`h-4 w-4 ${selectedFormat?.color || "text-purple-600"}`} />
            <span>{selectedFormat?.label || "Select format"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {disabled && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1">
            Subscribe to unlock all formats
          </div>
        )}
        {FORMAT_OPTIONS.map((format) => {
          const IconComponent = format.icon;
          return (
            <DropdownMenuItem
              key={format.value}
              onClick={() => onValueChange(format.value)}
              disabled={disabled && format.value !== value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconComponent className={`h-4 w-4 ${format.color}`} />
              <div className="flex flex-col">
                <div className="font-medium">{format.label}</div>
                <div className="text-xs text-muted-foreground">{format.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FormatSelector;
