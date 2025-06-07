import { Scale, Weight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface UnitSelectorProps {
  value: string;
  onValueChange: (value: WeightUnit) => void;
}

export type WeightUnit = "kg" | "lbs";

const UnitSelector: React.FunctionComponent<UnitSelectorProps> = ({
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
        value="kg"
        aria-label="Kilograms"
        className="flex flex-col gap-2 p-4 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Scale className="h-5 w-5" />
        <div className="text-sm font-medium">Metric</div>
        <div className="text-xs text-muted-foreground">Kilograms (kg)</div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="lbs"
        aria-label="Pounds"
        className="flex flex-col gap-2 p-4 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Weight className="h-5 w-5" />
        <div className="text-sm font-medium">Imperial</div>
        <div className="text-xs text-muted-foreground">Pounds (lbs)</div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default UnitSelector;
