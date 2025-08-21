import { MovementId } from "@/lib/movementId";
import { Movement } from "@/lib/movementList";
import * as React from "react";

interface ToggableMovementProps {
  movement: Movement;
  selectedMovements: MovementId[];
  handleToggleMovement: (movement: MovementId) => void;
}

const ToggableMovement: React.FunctionComponent<ToggableMovementProps> = ({
  movement,
  selectedMovements,
  handleToggleMovement,
}) => {
  const isSelected = selectedMovements.includes(movement.id);

  return (
    <div
      key={movement.id}
      className={`p-4 text-center rounded-lg transition-all flex items-center justify-center text-sm sm:text-base font-medium md:p-1 ${
        isSelected
          ? "bg-blue-500 text-white cursor-pointer"
          : "bg-secondary text-primary cursor-pointer"
      }`}
      onClick={() => handleToggleMovement(movement.id)}
    >
      {movement.name}
    </div>
  );
};

export default ToggableMovement;
