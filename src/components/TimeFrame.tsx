import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";

interface TimeFrameProps {
  timeFrame: number;
  setTimeFrame: (timeframe: number) => void;
}

const TimeFrame: React.FunctionComponent<TimeFrameProps> = ({
  timeFrame,
  setTimeFrame,
}) => {
  return (
    <div className="flex items-center justify-center space-x-8">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => setTimeFrame(timeFrame - 10)}
      >
        <Minus />
        <span className="sr-only">Decrease</span>
      </Button>
      <div className="text-center">
        <div className="text-5xl font-bold tracking-tighter">{timeFrame}</div>
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
  );
};

export default TimeFrame;
