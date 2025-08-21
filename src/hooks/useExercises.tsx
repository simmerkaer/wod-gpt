import { MovementId, MovementUsageMode } from "@/lib/movementId";
import { useState } from "react";

export const useMovements = () => {
  const [selectedMovements, setSelectedMovements] = useState<MovementId[]>([
    "burpee",
    "pushup",
    "pullup",
    "deadlift",
  ]);
  
  const [movementUsageMode, setMovementUsageMode] = useState<MovementUsageMode>("some");

  const toggleMovement = (movement: MovementId) => {
    setSelectedMovements((prevSelected) =>
      prevSelected.includes(movement)
        ? prevSelected.filter((m) => m !== movement)
        : [...prevSelected, movement],
    );
  };

  return {
    selectedMovements,
    toggleMovement,
    movementUsageMode,
    setMovementUsageMode,
  };
};
