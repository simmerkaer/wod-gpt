import { MovementId } from "@/lib/movementId";
import { Movement } from "@/lib/movementList";
import * as React from "react";

interface ToggableMovementProps {
  movement: Movement;
  selectedMovements: MovementId[];
  handleToggleMovement: (movement: MovementId) => void;
  isAtLimit?: boolean;
}

const ToggableMovement: React.FunctionComponent<ToggableMovementProps> = ({
  movement,
  selectedMovements,
  handleToggleMovement,
  isAtLimit = false,
}) => {
  const isSelected = selectedMovements.includes(movement.id);
  const isDisabled = isAtLimit && !isSelected;

  return (
    <div
      key={movement.id}
      className={`p-4 text-center rounded-lg transition-all flex items-center justify-center text-sm sm:text-base font-medium md:p-1 ${
        isDisabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : isSelected
          ? "bg-blue-500 text-white cursor-pointer"
          : "bg-secondary text-primary cursor-pointer"
      }`}
      onClick={() => !isDisabled && handleToggleMovement(movement.id)}
    >
      {movement.name}
    </div>
  );
};

export default ToggableMovement;
