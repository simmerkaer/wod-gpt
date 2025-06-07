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
  return (
    <div
      key={movement.id}
      className={`p-4 text-center rounded-lg cursor-pointer transition-all flex items-center justify-center text-sm sm:text-base font-medium md:p-1
${
  selectedMovements.includes(movement.id)
    ? "bg-blue-500 text-white"
    : "bg-secondary text-primary"
}`}
      onClick={() => handleToggleMovement(movement.id)}
    >
      {movement.name}
    </div>
  );
};

export default ToggableMovement;
