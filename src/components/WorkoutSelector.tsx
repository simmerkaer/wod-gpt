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
    <ToggleGroup type="single" value={value} onValueChange={onValueChange}>
      <ToggleGroupItem
        value="random"
        aria-label="specified"
        className={`flex-1 ${
          value === "random" ? "border border-[#0ea5e9]" : ""
        }`}
      >
        <div className="text-xs">Random WOD</div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="specified"
        aria-label="specified"
        className={`flex-1  ${
          value === "specified" ? "border border-[#0ea5e9]" : ""
        }`}
      >
        <div className="text-xs">Specific movements</div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default WorkoutSelector;
