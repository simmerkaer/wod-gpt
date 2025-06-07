import { Settings, Shuffle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface WorkoutSelectorProps {
  value: string;
  onValueChange: (value: WorkoutType) => void;
}

export type WorkoutType = "random" | "specified";
const WorkoutSelector: React.FunctionComponent<WorkoutSelectorProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className="grid w-full grid-cols-2"
    >
      <ToggleGroupItem
        value="random"
        aria-label="random movements"
        className="flex flex-col gap-1.5 p-3 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Shuffle className="h-4 w-4" />
        <div className="text-sm font-medium">Random</div>
        <div className="text-xs text-muted-foreground">
          Let AI pick movements
        </div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="specified"
        aria-label="specified movements"
        className="flex flex-col gap-1.5 p-3 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Settings className="h-4 w-4" />
        <div className="text-sm font-medium">Custom</div>
        <div className="text-xs text-muted-foreground">
          Choose your movements
        </div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default WorkoutSelector;
