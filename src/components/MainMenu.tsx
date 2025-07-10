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
import UnitSelector, { WeightUnit } from "./UnitSelector";
import WorkoutSelector, { WorkoutType } from "./WorkoutSelector";
import WorkoutLength, { WorkoutLengthOption } from "./WorkoutLength";

interface MainMenuProps {
  isLoading: boolean;
  workoutType: WorkoutType;
  formatType: FormatType;
  workoutFormat: WorkoutFormat;
  weightUnit: WeightUnit;
  workoutLength: WorkoutLengthOption;
  customMinutes: number;
  selectedMovements: MovementId[];
  toggleMovement: (movement: MovementId) => void;
  setWorkoutType: (workoutType: WorkoutType) => void;
  setFormatType: (formatType: FormatType) => void;
  setWorkoutFormat: (workoutFormat: WorkoutFormat) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  setWorkoutLength: (workoutLength: WorkoutLengthOption) => void;
  setCustomMinutes: (minutes: number) => void;
  handleGenerateWod: () => void;
}

const MainMenu: React.FunctionComponent<MainMenuProps> = ({
  isLoading,
  workoutType,
  formatType,
  workoutFormat,
  weightUnit,
  workoutLength,
  customMinutes,
  selectedMovements,
  toggleMovement,
  setWorkoutType,
  setFormatType,
  setWorkoutFormat,
  setWeightUnit,
  setWorkoutLength,
  setCustomMinutes,
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
        <div className="flex-grow flex flex-col gap-4">
          {/* Movement Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border"></div>
              <h3 className="text-sm font-medium text-muted-foreground text-center whitespace-nowrap px-2">
                Movement Selection
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <WorkoutSelector
              value={workoutType}
              onValueChange={setWorkoutType}
            />
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
                          "rounded-full pr-2 pl-3 py-1.5 gap-1.5 cursor-pointer !text-sm select-none focus:ring-offset-1 hover:ring-1",
                      })}
                    >
                      <PlusIcon className="h-3 w-3 mr-2" /> add movements
                    </button>
                  }
                  toggleMovement={toggleMovement}
                />
              }
              onRemoveMovement={toggleMovement}
            />
          </div>

          {/* Workout Format Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border"></div>
              <h3 className="text-sm font-medium text-muted-foreground text-center whitespace-nowrap px-2">
                Workout Format
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <FormatSelector value={formatType} onValueChange={setFormatType} />
            {formatType === "specific" && (
              <div className="pl-2">
                <SpecificFormatSelector
                  value={workoutFormat}
                  onValueChange={setWorkoutFormat}
                />
              </div>
            )}
          </div>

          {/* Workout Length Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border"></div>
              <h3 className="text-sm font-medium text-muted-foreground text-center whitespace-nowrap px-2">
                Workout Length
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <WorkoutLength
              selectedLength={workoutLength}
              customMinutes={customMinutes}
              onLengthChange={setWorkoutLength}
              onCustomMinutesChange={setCustomMinutes}
            />
          </div>

          {/* Weight Unit Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border"></div>
              <h3 className="text-sm font-medium text-muted-foreground text-center whitespace-nowrap px-2">
                Weight Units
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <UnitSelector value={weightUnit} onValueChange={setWeightUnit} />
          </div>

          {/* Generate Button */}
          <div className="pt-3">
            <Button
              onClick={handleGenerateWod}
              className="w-full bg-gradient-to-r from-red-500 to-purple-600 align-middle hover:from-red-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
              disabled={isLoading}
              size="lg"
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
