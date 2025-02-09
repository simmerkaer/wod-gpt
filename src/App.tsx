import { useState } from "react";
import "./App.css";
import GeneratedWod from "./components/GeneratedWod";
import MainMenu from "./components/MainMenu";
import MovementList from "./components/MovementList";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { Button } from "./components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./components/ui/drawer";
import { ScrollArea } from "./components/ui/scroll-area";
import { WorkoutType } from "./components/WorkoutSelector";
import { useMovements } from "./hooks/useExercises";
import { useGenerateWod } from "./hooks/useWod";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";

function App() {
  const { selectedMovements, toggleMovement, movements } = useMovements();
  const [workoutType, setWorkoutType] = useState<WorkoutType>("random");
  const [fetchWod, isLoading, wod] = useGenerateWod();
  const { theme } = useTheme();

  const handleGenerateWod = () => {
    fetchWod(workoutType === "random", selectedMovements);
  };

  const handleWorkoutChange = (type: WorkoutType) => {
    if (!type) return;
    setWorkoutType(type);
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        {theme === "dark" ? <DarkBackground /> : <LightBackground />}
      </div>
      <ToggleDarkMode />
      <div className={`flex-grow md:w-1/2 md:mx-auto`}>
        <div className="mx-auto flex w-full max-w-lg items-center justify-center">
          <div className="relative z-10 flex w-full cursor-pointer items-center overflow-hidden rounded-xl p-[1.5px]">
            <div
              className={`${isLoading ? "visible" : "invisible"} animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(#0ea5e9_20deg,transparent_120deg)]`}
            ></div>
            <div className="relative z-20 flex w-full rounded-[0.60rem]">
              <MainMenu
                isLoading={isLoading}
                workoutType={workoutType}
                handleGenerateWod={handleGenerateWod}
                setWorkoutType={handleWorkoutChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8">
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
                <MovementList
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
