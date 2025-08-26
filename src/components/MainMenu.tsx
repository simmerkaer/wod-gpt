import { MovementId, MovementUsageMode } from "@/lib/movementId";
import { Loader2, PlusIcon, ZapIcon, User } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import FormatSelector, { FormatType } from "./FormatSelector";
import GiveFeedback from "./GiveFeedback";
import SelectedMovements from "./SelectedMovements";
import SelectMovements from "./SelectMovements";
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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import UnitSelector, { WeightUnit } from "./UnitSelector";
import WorkoutSelector, { WorkoutType } from "./WorkoutSelector";
import WorkoutLength, { WorkoutLengthOption } from "./WorkoutLength";
import WorkoutIntentSelector, { WorkoutIntent } from "./WorkoutIntent";
import { useAuth } from "../hooks/useAuth";

interface MainMenuProps {
  isLoading: boolean;
  workoutType: WorkoutType;
  formatType: FormatType;
  weightUnit: WeightUnit;
  workoutLength: WorkoutLengthOption;
  customMinutes: number;
  workoutIntent: WorkoutIntent;
  selectedMovements: MovementId[];
  movementUsageMode: MovementUsageMode;
  toggleMovement: (movement: MovementId) => void;
  setWorkoutType: (workoutType: WorkoutType) => void;
  setFormatType: (formatType: FormatType) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  setWorkoutLength: (workoutLength: WorkoutLengthOption) => void;
  setCustomMinutes: (minutes: number) => void;
  setWorkoutIntent: (workoutIntent: WorkoutIntent) => void;
  setMovementUsageMode: (mode: MovementUsageMode) => void;
  handleGenerateWod: () => void;
}

const MainMenu: React.FunctionComponent<MainMenuProps> = ({
  isLoading,
  workoutType,
  formatType,
  weightUnit,
  workoutLength,
  customMinutes,
  workoutIntent,
  selectedMovements,
  movementUsageMode,
  toggleMovement,
  setWorkoutType,
  setFormatType,
  setWeightUnit,
  setWorkoutLength,
  setCustomMinutes,
  setWorkoutIntent,
  setMovementUsageMode,
  handleGenerateWod,
}) => {
  const { isAuthenticated } = useAuth();
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
            
            {/* Movement Usage Mode */}
            {workoutType === "specified" && selectedMovements.length > 0 && (
              <div className="mt-3">
                <ToggleGroup 
                  type="single" 
                  value={movementUsageMode}
                  onValueChange={(value: MovementUsageMode) => value && setMovementUsageMode(value)}
                  className="justify-center gap-2"
                >
                  <ToggleGroupItem 
                    value="some" 
                    className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
                  >
                    Use SOME of selected movements
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="all" 
                    className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
                  >
                    Use ALL selected movements
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
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
          </div>

          {/* Workout Intent Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border"></div>
              <h3 className="text-sm font-medium text-muted-foreground text-center whitespace-nowrap px-2">
                Workout Intent
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <WorkoutIntentSelector
              value={workoutIntent}
              onValueChange={setWorkoutIntent}
            />
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
          <div className="pt-3 space-y-2">
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
            
            {/* View Profile Button - only show if authenticated */}
            {isAuthenticated && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            )}
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
