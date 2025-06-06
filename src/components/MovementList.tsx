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

  // Function to get all movements in a category
  const getMovementsInCategory = (
    category: MovementCatergory,
  ): MovementId[] => {
    return movements
      .filter((movement) => movement.category === category)
      .map((movement) => movement.id);
  };

  // Function to check if all movements in a category are selected
  const areAllMovementsSelected = (category: MovementCatergory): boolean => {
    const categoryMovements = getMovementsInCategory(category);
    return categoryMovements.every((movementId) =>
      selectedMovements.includes(movementId),
    );
  };

  // Function to handle select/deselect all for a category
  const handleSelectAllCategory = (category: MovementCatergory) => {
    const categoryMovements = getMovementsInCategory(category);
    const allSelected = areAllMovementsSelected(category);

    if (allSelected) {
      // Deselect all movements in this category
      categoryMovements.forEach((movementId) => {
        if (selectedMovements.includes(movementId)) {
          handleToggleMovement(movementId);
        }
      });
    } else {
      // Select all movements in this category
      categoryMovements.forEach((movementId) => {
        if (!selectedMovements.includes(movementId)) {
          handleToggleMovement(movementId);
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex flex-wrap space-x-2">
        {movementCategories.map((category) => (
          <div key={category.category} className="mb-4 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl font-bold capitalize text-center">
                {category.displayTitle}
              </h2>
              <input
                type="checkbox"
                checked={areAllMovementsSelected(category.category)}
                onChange={() => handleSelectAllCategory(category.category)}
                className="w-4 h-4 cursor-pointer"
                title={`Select all ${category.displayTitle.toLowerCase()} movements`}
              />
              <span className="text-sm text-gray-500">(select all)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
              {movements
                .filter((x) => x.category === category.category)
                .map((movement) => (
                  <ToggableMovement
                    key={movement.id}
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
