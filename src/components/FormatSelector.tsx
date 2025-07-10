import { Settings, Shuffle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface FormatSelectorProps {
  value: string;
  onValueChange: (value: FormatType) => void;
}

export type FormatType = "random" | "specific";
const FormatSelector: React.FunctionComponent<FormatSelectorProps> = ({
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
        aria-label="random format"
        className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Shuffle className="h-4 w-4" />
        <div className="text-sm font-medium">Random</div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="specific"
        aria-label="specific format"
        className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
      >
        <Settings className="h-4 w-4" />
        <div className="text-sm font-medium">Specific</div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default FormatSelector;
