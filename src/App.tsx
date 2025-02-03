import { useState } from "react";
import "./App.css";
import ExerciseList from "./components/ExerciseList";
import { useExercises } from "./hooks/useExercises";
import GeneratedWod from "./components/GeneratedWod";
import TimeFrame from "./components/TimeFrame";
import { useWod } from "./hooks/useWod";
import { Button } from "./components/ui/button";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from "./components/ui/drawer";

function App() {
  const { selectedMovements, toggleMovement, ...movements } = useExercises();
  const [timeFrame, setTimeFrame] = useState(30);
  const [fetchWod, isLoading, wod] = useWod();

  const handleGenerateWod = () => {
    fetchWod(selectedMovements, timeFrame);
  };

  return (
    <div className="md:flex w-[80vw]">
      <div className="md:basis-1/3">
        <TimeFrame
          timeFrame={timeFrame}
          isLoading={isLoading}
          setTimeFrame={setTimeFrame}
          handleGenerateWod={handleGenerateWod}
        />
        <GeneratedWod wod={wod} />
      </div>
      <div className="md:basis-2/3">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
              Select movements
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            </DrawerHeader>
            <ExerciseList
              movements={movements}
              selectedMovements={selectedMovements}
              handleToggleMovement={toggleMovement}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export default App;
