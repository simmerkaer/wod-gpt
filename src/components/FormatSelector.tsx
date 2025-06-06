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
    <ToggleGroup type="single" value={value} onValueChange={onValueChange}>
      <ToggleGroupItem
        value="random"
        aria-label="random format"
        className={`flex-1 ${
          value === "random" ? "border border-[#0ea5e9]" : ""
        }`}
      >
        <div className="text-xs">Random format</div>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="specific"
        aria-label="specific format"
        className={`flex-1  ${
          value === "specific" ? "border border-[#0ea5e9]" : ""
        }`}
      >
        <div className="text-xs">Specific format</div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default FormatSelector;