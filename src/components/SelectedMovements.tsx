import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "./ui/badge";

interface SelectedMovementsProps {
  selectedMovements: MovementId[];
  addMoreMovementsButton: React.ReactNode;
  onRemoveMovement: (movement: MovementId) => void;
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
          {movements.find((y) => y.id === x)?.name ?? "invalid movement name"}
          <XIcon className="h-3 w-3" />
        </Badge>
      ))}
      {addMoreMovementsButton}
    </div>
  );
};

export default SelectedMovements;
