import { MovementId } from "@/lib/movementId";
import movements, { MovementCatergory } from "@/lib/movementList";
import * as React from "react";
import ToggableMovement from "./ToggableMovement";

interface MovementListProps {
  selectedMovements: MovementId[];
  handleToggleMovement: (movement: MovementId) => void;
}

const MovementList: React.FunctionComponent<MovementListProps> = ({
  selectedMovements,
  handleToggleMovement,
}) => {
  const movementCategories: {
    category: MovementCatergory;
    displayTitle: string;
  }[] = [
    { category: "bodyweight", displayTitle: "Bodyweight" },
    { category: "weightlifting", displayTitle: "Weightlifting" },
    { category: "kettlebell", displayTitle: "Kettlebell" },
    { category: "gymnastics", displayTitle: "Gymnastics" },
    { category: "box", displayTitle: "Box" },
    { category: "cardio", displayTitle: "Cardio" },
    { category: "odd_object", displayTitle: "Odd Object" },
    { category: "wall_ball", displayTitle: "Wall Ball" },
    { category: "dumbbell", displayTitle: "Dumbbell" },
    { category: "other_functional", displayTitle: "Other Functional" },
  ];

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex flex-wrap space-x-2">
        {movementCategories.map((category) => (
          <div key={category.category} className="mb-4 w-full">
            <h2 className="text-xl font-bold capitalize mb-2 text-center">
              {category.displayTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
              {movements
                .filter((x) => x.category === category.category)
                .map((movement) => (
                  <ToggableMovement
                    movement={movement}
                    selectedMovements={selectedMovements}
                    handleToggleMovement={handleToggleMovement}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovementList;
