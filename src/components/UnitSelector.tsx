import { Scale, Weight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface UnitSelectorProps {
  value: string;
  onValueChange: (value: WeightUnit) => void;
  /** Short labels KG / LBS (e.g. mobile nav menu) */
  compact?: boolean;
}

export type WeightUnit = "kg" | "lbs";

const UnitSelector: React.FunctionComponent<UnitSelectorProps> = ({
  value,
  onValueChange,
  compact = false,
}) => {
  if (compact) {
    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="grid w-full grid-cols-2 gap-2"
      >
        <ToggleGroupItem
          value="kg"
          aria-label="Kilograms"
          className="h-10 text-sm font-semibold data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
        >
          KG
        </ToggleGroupItem>
        <ToggleGroupItem
          value="lbs"
          aria-label="Pounds"
          className="h-10 text-sm font-semibold data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
        >
          LBS
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

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
        className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Scale className="h-4 w-4" />
        <div className="text-sm font-medium">Metric (kg)</div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="lbs"
        aria-label="Pounds"
        className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Weight className="h-4 w-4" />
        <div className="text-sm font-medium">Imperial (lbs)</div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default UnitSelector;
