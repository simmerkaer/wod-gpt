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
import { WorkoutLengthOption } from "./components/WorkoutLength";
import { WorkoutIntent } from "./components/WorkoutIntent";
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
  const [workoutLength, setWorkoutLength] =
    useState<WorkoutLengthOption>("medium");
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [workoutIntent, setWorkoutIntent] = useState<WorkoutIntent>("general_fitness");
  const [fetchWod, { wod, timing, confidence, isLoading, error }] =
    useGenerateWod();
  const { theme } = useTheme();

  const handleGenerateWod = () => {
    fetchWod(
      workoutType === "random",
      selectedMovements,
      formatType,
      workoutFormat,
      weightUnit,
      workoutLength,
      customMinutes,
      workoutIntent,
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

  const handleWorkoutLengthChange = (length: WorkoutLengthOption) => {
    if (!length) return;
    setWorkoutLength(length);
  };

  const handleCustomMinutesChange = (minutes: number) => {
    setCustomMinutes(minutes);
  };

  const handleWorkoutIntentChange = (intent: WorkoutIntent) => {
    if (!intent) return;
    setWorkoutIntent(intent);
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        {theme === "dark" ? <DarkBackground /> : <LightBackground />}
      </div>
      <ToggleDarkMode />
      <main className="flex-grow">
        {/* Mobile Layout: Vertical Stack */}
        <div className="lg:hidden flex flex-col items-center">
          <div className="w-full max-w-lg">
            <FancyLoadingSpinner isLoading={isLoading}>
              <MainMenu
                isLoading={isLoading}
                workoutType={workoutType}
                formatType={formatType}
                workoutFormat={workoutFormat}
                weightUnit={weightUnit}
                workoutLength={workoutLength}
                customMinutes={customMinutes}
                workoutIntent={workoutIntent}
                selectedMovements={selectedMovements}
                handleGenerateWod={handleGenerateWod}
                setWorkoutType={handleWorkoutChange}
                setFormatType={handleFormatChange}
                setWorkoutFormat={handleWorkoutFormatChange}
                setWeightUnit={handleWeightUnitChange}
                setWorkoutLength={handleWorkoutLengthChange}
                setCustomMinutes={handleCustomMinutesChange}
                setWorkoutIntent={handleWorkoutIntentChange}
                toggleMovement={toggleMovement}
              />
            </FancyLoadingSpinner>
          </div>
          <section
            className="flex flex-col items-center justify-center mt-8 w-full"
            aria-label="Generated Workout"
          >
            <GeneratedWod
              wod={wod}
              timing={timing}
              confidence={confidence}
              error={error}
            />
          </section>
        </div>

        {/* Desktop Layout: Side by Side */}
        <div className="hidden lg:flex lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-8 lg:items-center lg:min-h-[80vh] lg:gap-8">
          {/* Left Column: Menu */}
          <div
            className={`lg:w-1/2 flex-shrink-0 transition-all duration-500 ease-in-out ${
              wod ? "lg:translate-x-0" : "lg:translate-x-1/2"
            }`}
          >
            <FancyLoadingSpinner isLoading={isLoading}>
              <MainMenu
                isLoading={isLoading}
                workoutType={workoutType}
                formatType={formatType}
                workoutFormat={workoutFormat}
                weightUnit={weightUnit}
                workoutLength={workoutLength}
                customMinutes={customMinutes}
                workoutIntent={workoutIntent}
                selectedMovements={selectedMovements}
                handleGenerateWod={handleGenerateWod}
                setWorkoutType={handleWorkoutChange}
                setFormatType={handleFormatChange}
                setWorkoutFormat={handleWorkoutFormatChange}
                setWeightUnit={handleWeightUnitChange}
                setWorkoutLength={handleWorkoutLengthChange}
                setCustomMinutes={handleCustomMinutesChange}
                setWorkoutIntent={handleWorkoutIntentChange}
                toggleMovement={toggleMovement}
              />
            </FancyLoadingSpinner>
          </div>

          {/* Right Column: Generated Workout - Slides in from right */}
          <section
            className={`lg:w-1/2 flex-shrink-0 transition-all duration-500 ease-in-out ${
              wod
                ? "lg:translate-x-0 lg:opacity-100"
                : "lg:translate-x-full lg:opacity-0"
            }`}
            aria-label="Generated Workout"
          >
            {wod && (
              <GeneratedWod
                wod={wod}
                timing={timing}
                confidence={confidence}
                error={error}
              />
            )}
          </section>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
