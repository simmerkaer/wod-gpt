import { useState } from "react";
import "./App.css";
import ExerciseList from "./components/ExerciseList";
import { useExercises } from "./hooks/useExercises";
import GeneratedWod from "./components/GeneratedWod";
import MainMenu from "./components/MainMenu";
import { useWod } from "./hooks/useWod";
import { Button } from "./components/ui/button";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Drawer,
} from "./components/ui/drawer";
import { ScrollArea } from "./components/ui/scroll-area";
import { WorkoutType } from "./components/WorkoutSelector";

function App() {
  const { selectedMovements, toggleMovement, ...movements } = useExercises();
  const [timeFrame, setTimeFrame] = useState(30);
  const [workoutType, setWorkoutType] = useState<WorkoutType>("random");
  const [fetchWod, isLoading, wod] = useWod();

  const handleGenerateWod = () => {
    fetchWod(workoutType === "random", selectedMovements, timeFrame);
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex-grow md:w-1/2 md:mx-auto">
        <MainMenu
          timeFrame={timeFrame}
          isLoading={isLoading}
          workoutType={workoutType}
          setTimeFrame={setTimeFrame}
          handleGenerateWod={handleGenerateWod}
          setWorkoutType={setWorkoutType}
        />
      </div>
      <div className="flex justify-center mt-8">
        <GeneratedWod wod={wod} />
      </div>
      <div>
        {workoutType === "specified" && (
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
                <DrawerTitle className="text-center">Movements</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="h-[80vh]">
                <ExerciseList
                  movements={movements}
                  selectedMovements={selectedMovements}
                  handleToggleMovement={toggleMovement}
                />
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}

export default App;
