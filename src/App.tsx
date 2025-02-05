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
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { ThemeProvider } from "./ThemeProvider";

function App() {
  const { selectedMovements, toggleMovement, ...movements } = useExercises();
  const [timeFrame, setTimeFrame] = useState(30);
  const [workoutType, setWorkoutType] = useState<WorkoutType>("random");
  const [fetchWod, isLoading, wod] = useWod();

  const handleGenerateWod = () => {
    fetchWod(workoutType === "random", selectedMovements, timeFrame);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col flex-grow">
        <ToggleDarkMode />
        <div className={`flex-grow md:w-1/2 md:mx-auto`}>
          <div className="mx-auto flex w-full max-w-lg items-center justify-center">
            <div className="relative z-10 flex w-full cursor-pointer items-center overflow-hidden rounded-xl p-[1.5px]">
              <div
                className={`${isLoading ? "visible" : "invisible"} animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(#0ea5e9_20deg,transparent_120deg)]`}
              ></div>
              <div className="relative z-20 flex w-full rounded-[0.60rem]">
                <MainMenu
                  timeFrame={timeFrame}
                  isLoading={isLoading}
                  workoutType={workoutType}
                  setTimeFrame={setTimeFrame}
                  handleGenerateWod={handleGenerateWod}
                  setWorkoutType={setWorkoutType}
                />
              </div>
            </div>
          </div>
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
                  className="fixed bottom-4 right-4 bg-[#0ea5e9] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
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
    </ThemeProvider>
  );
}

export default App;
