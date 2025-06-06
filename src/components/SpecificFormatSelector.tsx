import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface SpecificFormatSelectorProps {
  value: string;
  onValueChange: (value: WorkoutFormat) => void;
}

export type WorkoutFormat =
  | "amrap"
  | "emom"
  | "for_time"
  | "intervals"
  | "chipper"
  | "strength_metcon";

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const SpecificFormatSelector: React.FunctionComponent<
  SpecificFormatSelectorProps
> = ({ value, onValueChange }) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-3 gap-2 w-full"
      >
        <ToggleGroupItem
          value="amrap"
          aria-label="AMRAP"
          className={`text-xs ${
            value === "amrap" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          AMRAP
        </ToggleGroupItem>
        <ToggleGroupItem
          value="emom"
          aria-label="EMOM"
          className={`text-xs ${
            value === "emom" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          EMOM
        </ToggleGroupItem>
        <ToggleGroupItem
          value="for_time"
          aria-label="For Time"
          className={`text-xs ${
            value === "for_time" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          For Time
        </ToggleGroupItem>
        <ToggleGroupItem
          value="intervals"
          aria-label="Intervals"
          className={`text-xs ${
            value === "intervals" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          Intervals
        </ToggleGroupItem>
        <ToggleGroupItem
          value="chipper"
          aria-label="Chipper"
          className={`text-xs ${
            value === "chipper" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          Chipper
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strength_metcon"
          aria-label="Strength + Metcon"
          className={`text-xs ${
            value === "strength_metcon" ? "border border-[#0ea5e9]" : ""
          }`}
        >
          Strength + Metcon
        </ToggleGroupItem>
      </ToggleGroup>
    </motion.div>
  );
};

export default SpecificFormatSelector;
