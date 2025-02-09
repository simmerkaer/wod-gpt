import { Loader2 } from "lucide-react";
import * as React from "react";
import GiveFeedback from "./GiveFeedback";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import WorkoutSelector, { WorkoutType } from "./WorkoutSelector";

interface MainMenuProps {
  timeFrame: number;
  isLoading: boolean;
  workoutType: WorkoutType;
  setWorkoutType: (workoutType: WorkoutType) => void;
  setTimeFrame: (timeframe: number) => void;
  handleGenerateWod: () => void;
}

const MainMenu: React.FunctionComponent<MainMenuProps> = ({
  isLoading,
  workoutType,
  setWorkoutType,
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
          <Button
            onClick={handleGenerateWod}
            className="w-full bg-gradient-to-r from-red-500 to-purple-600 align-middle"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Generate WOD"}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex-grow flex flex-col gap-2">
          <GiveFeedback />
        </div>
      </CardFooter>
    </Card>
  );
};

export default MainMenu;
