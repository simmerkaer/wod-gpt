import { useState } from "react";
import "./App.css";
import FancyLoadingSpinner from "./components/FancyLoadingSpinner";
import { FormatType } from "./components/FormatSelector";
import GeneratedWod from "./components/GeneratedWod";
import MainMenu from "./components/MainMenu";
import { WorkoutFormat } from "./components/SpecificFormatSelector";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { Toaster } from "./components/ui/toaster";
import { WeightUnit } from "./components/UnitSelector";
import { WorkoutType } from "./components/WorkoutSelector";
import { useMovements } from "./hooks/useExercises";
import { useGenerateWod } from "./hooks/useWod";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";

function App() {
  const { selectedMovements, toggleMovement } = useMovements();
  const [workoutType, setWorkoutType] = useState<WorkoutType>("random");
  const [formatType, setFormatType] = useState<FormatType>("random");
  const [workoutFormat, setWorkoutFormat] = useState<WorkoutFormat>("amrap");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [fetchWod, isLoading, wod] = useGenerateWod();
  const { theme } = useTheme();

  const handleGenerateWod = () => {
    fetchWod(
      workoutType === "random",
      selectedMovements,
      formatType,
      workoutFormat,
      weightUnit,
    );
  };

  const handleWorkoutChange = (type: WorkoutType) => {
    if (!type) return;
    setWorkoutType(type);
  };

  const handleFormatChange = (type: FormatType) => {
    if (!type) return;
    setFormatType(type);
  };

  const handleWorkoutFormatChange = (format: WorkoutFormat) => {
    if (!format) return;
    setWorkoutFormat(format);
  };

  const handleWeightUnitChange = (unit: WeightUnit) => {
    if (!unit) return;
    setWeightUnit(unit);
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
              formatType={formatType}
              workoutFormat={workoutFormat}
              weightUnit={weightUnit}
              selectedMovements={selectedMovements}
              handleGenerateWod={handleGenerateWod}
              setWorkoutType={handleWorkoutChange}
              setFormatType={handleFormatChange}
              setWorkoutFormat={handleWorkoutFormatChange}
              setWeightUnit={handleWeightUnitChange}
              toggleMovement={toggleMovement}
            />
          </FancyLoadingSpinner>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-8">
        <GeneratedWod wod={wod} />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
