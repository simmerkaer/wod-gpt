import * as React from "react";
import { Badge } from "./ui/badge";
import { XIcon } from "lucide-react";

interface SelectedMovementsProps {
  selectedMovements: string[];
  addMoreMovementsButton: React.ReactNode;
  onRemoveMovement: (movement: string) => void;
}

const SelectedMovements: React.FunctionComponent<SelectedMovementsProps> = ({
  selectedMovements,
  addMoreMovementsButton,
  onRemoveMovement,
}) => {
  return (
    <div className="flex flex-row flex-wrap gap-2 justify-center my-2">
      {selectedMovements.map((x) => (
        <Badge
          className="rounded-full pr-1 gap-1.5 cursor-pointer"
          variant={"secondary"}
          key={x}
          onClick={() => onRemoveMovement(x)}
        >
          {x}
          <XIcon className="h-3 w-3" />
        </Badge>
      ))}
      {addMoreMovementsButton}
    </div>
  );
};

export default SelectedMovements;
