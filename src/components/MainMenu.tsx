import { MovementId } from "@/lib/movementId";
import { Loader2, PlusIcon, ZapIcon } from "lucide-react";
import * as React from "react";
import FormatSelector, { FormatType } from "./FormatSelector";
import GiveFeedback from "./GiveFeedback";
import SelectedMovements from "./SelectedMovements";
import SelectMovements from "./SelectMovements";
import SpecificFormatSelector, {
  WorkoutFormat,
} from "./SpecificFormatSelector";
import { badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import WorkoutSelector, { WorkoutType } from "./WorkoutSelector";

interface MainMenuProps {
  isLoading: boolean;
  workoutType: WorkoutType;
  formatType: FormatType;
  workoutFormat: WorkoutFormat;
  selectedMovements: MovementId[];
  toggleMovement: (movement: MovementId) => void;
  setWorkoutType: (workoutType: WorkoutType) => void;
  setFormatType: (formatType: FormatType) => void;
  setWorkoutFormat: (workoutFormat: WorkoutFormat) => void;
  handleGenerateWod: () => void;
}

const MainMenu: React.FunctionComponent<MainMenuProps> = ({
  isLoading,
  workoutType,
  formatType,
  workoutFormat,
  selectedMovements,
  toggleMovement,
  setWorkoutType,
  setFormatType,
  setWorkoutFormat,
  handleGenerateWod,
}) => {
  return (
    <Card className="flex-grow rounded-[10px]">
      <CardHeader className="pb-4">
        <CardTitle>
          <p className="text-4xl bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent pb-2 font-extralight">
            wod-gpt
          </p>
        </CardTitle>
        <CardDescription>Free AI driven crossfit workouts</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex-grow flex flex-col gap-2">
          <WorkoutSelector value={workoutType} onValueChange={setWorkoutType} />
          <SelectedMovements
            show={workoutType === "specified"}
            selectedMovements={selectedMovements}
            addMoreMovementsButton={
              <SelectMovements
                selectedMovements={selectedMovements}
                trigger={
                  <button
                    className={badgeVariants({
                      variant: "secondary",
                      className:
                        "cursor-pointer select-none focus:ring-offset-1 hover:ring-1",
                    })}
                  >
                    <PlusIcon className="h-3 w-3 mr-2" /> add more
                  </button>
                }
                toggleMovement={toggleMovement}
              />
            }
            onRemoveMovement={toggleMovement}
          />
          <FormatSelector value={formatType} onValueChange={setFormatType} />
          {formatType === "specific" && (
            <SpecificFormatSelector
              value={workoutFormat}
              onValueChange={setWorkoutFormat}
            />
          )}
          <div className="flex flex-row gap-2">
            <Button
              onClick={handleGenerateWod}
              className="w-full bg-gradient-to-r from-red-500 to-purple-600 align-middle flex-grow"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>Generate WOD</span>
                  <ZapIcon />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex-grow flex flex-col gap-2">
          <Separator className="my-2" />
          <GiveFeedback />
        </div>
      </CardFooter>
    </Card>
  );
};

export default MainMenu;
