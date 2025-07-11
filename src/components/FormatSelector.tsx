import { ChevronDown, Zap } from "lucide-react";
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
}

export type FormatType = "amrap" | "emom" | "for_time" | "intervals" | "chipper" | "strength_metcon" | "random";

const FORMAT_OPTIONS = [
  {
    value: "emom" as FormatType,
    label: "EMOM",
    description: "Every Minute on the Minute",
  },
  {
    value: "amrap" as FormatType,
    label: "AMRAP",
    description: "As Many Rounds As Possible",
  },
  {
    value: "for_time" as FormatType,
    label: "For Time",
    description: "Complete as fast as possible",
  },
  {
    value: "intervals" as FormatType,
    label: "Intervals",
    description: "Timed work/rest periods",
  },
  {
    value: "chipper" as FormatType,
    label: "Chipper",
    description: "High volume, sequential",
  },
  {
    value: "strength_metcon" as FormatType,
    label: "Strength + MetCon",
    description: "Strength work + conditioning",
  },
  {
    value: "random" as FormatType,
    label: "Random",
    description: "Surprise me",
  },
] as const;

const FormatSelector: React.FunctionComponent<FormatSelectorProps> = ({
  value,
  onValueChange,
}) => {
  const selectedFormat = FORMAT_OPTIONS.find(format => format.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span>{selectedFormat?.label || "Select format"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {FORMAT_OPTIONS.map((format) => (
          <DropdownMenuItem 
            key={format.value} 
            onClick={() => onValueChange(format.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Zap className="h-4 w-4 text-purple-600" />
            <div className="flex flex-col">
              <div className="font-medium">{format.label}</div>
              <div className="text-xs text-muted-foreground">{format.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FormatSelector;
