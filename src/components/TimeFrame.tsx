import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface TimeFrameProps {
  timeFrame: number;
  setTimeFrame: (timeframe: number) => void;
  handleGenerateWod: () => void;
  children?: React.ReactNode;
}

const TimeFrame: React.FunctionComponent<TimeFrameProps> = ({
  timeFrame,
  setTimeFrame,
  handleGenerateWod,
  children,
}) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>WOD Generation</CardTitle>
        <CardDescription>I want to work out for roughly</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={() => setTimeFrame(timeFrame - 10)}
          >
            <Minus />
            <span className="sr-only">Decrease</span>
          </Button>
          <div className="flex-1 text-center">
            <div className="text-5xl font-bold tracking-tighter">
              {timeFrame}
            </div>
            <div className="text-[0.70rem] uppercase text-muted-foreground">
              Minutes
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={() => setTimeFrame(timeFrame + 10)}
          >
            <Plus />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateWod} className="w-full">
          Generate WOD
        </Button>
      </CardFooter>
      {children}
    </Card>
  );
};

export default TimeFrame;
