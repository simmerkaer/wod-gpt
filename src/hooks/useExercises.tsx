import { MovementId } from "@/lib/movementId";
import { useState } from "react";

export const useMovements = () => {
  const [selectedMovements, setSelectedMovements] = useState<MovementId[]>([
    "burpee",
    "pushup",
    "pullup",
    "deadlift",
  ]);

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
  };
};
