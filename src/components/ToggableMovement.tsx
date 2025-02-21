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
      className={`p-4 text-center rounded-lg cursor-pointer transition-all flex items-center justify-center text-sm sm:text-base font-medium
${
  selectedMovements.includes(movement.id)
    ? "bg-blue-500 text-white"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
}`}
      onClick={() => handleToggleMovement(movement.id)}
    >
      {movement.name}
    </div>
  );
};

export default ToggableMovement;
