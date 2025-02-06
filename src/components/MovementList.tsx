import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Movement, MovementCatergory } from "@/lib/movementList";
import { MovementId } from "@/lib/movementId";
import * as React from "react";

interface MovementListProps {
  movements: Movement[];
  selectedMovements: MovementId[];
  handleToggleMovement: (movement: MovementId) => void;
}

const MovementList: React.FunctionComponent<MovementListProps> = ({
  movements,
  selectedMovements,
  handleToggleMovement,
}) => {
  const movementCategories: MovementCatergory[] = [
    "bodyweight",
    "weightlifting",
    "kettlebell",
    "gymnastics",
    "box",
    "cardio",
    "odd_object",
    "wall_ball",
    "dumbbell",
    "other_functional",
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardDescription>
          I want the workout to include these movements (click to toggle)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex flex-wrap space-x-2 m-2">
            {movementCategories.map((category) => (
              <div key={category} className="mb-6 w-full">
                <h2 className="text-xl font-bold capitalize mb-2">
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
                  {movements
                    .filter((x) => x.category === category)
                    .map((movement) => (
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
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovementList;
