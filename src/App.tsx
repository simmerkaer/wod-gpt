import { useState } from "react";
import "./App.css";
import FancyLoadingSpinner from "./components/FancyLoadingSpinner";
import GeneratedWod from "./components/GeneratedWod";
import MainMenu from "./components/MainMenu";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { WorkoutType } from "./components/WorkoutSelector";
import { useMovements } from "./hooks/useExercises";
import { useGenerateWod } from "./hooks/useWod";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";

function App() {
  const { selectedMovements, toggleMovement } = useMovements();
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
      <div className="flex-grow md:w-1/2 md:mx-auto">
        <div className="mx-auto flex w-full max-w-lg items-center justify-center">
          <FancyLoadingSpinner isLoading={isLoading}>
            <MainMenu
              isLoading={isLoading}
              workoutType={workoutType}
              selectedMovements={selectedMovements}
              handleGenerateWod={handleGenerateWod}
              setWorkoutType={handleWorkoutChange}
              toggleMovement={toggleMovement}
            />
          </FancyLoadingSpinner>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8">
        <GeneratedWod wod={wod} />
      </div>
    </div>
  );
}

export default App;
