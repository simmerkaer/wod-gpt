import { useState, useMemo } from "react";
import FancyLoadingSpinner from "../components/FancyLoadingSpinner";
import { FormatType } from "../components/FormatSelector";
import GeneratedWod from "../components/GeneratedWod";
import MainMenu from "../components/MainMenu";
import { WorkoutType } from "../components/WorkoutSelector";
import { WorkoutLengthOption } from "../components/WorkoutLength";
import { WorkoutIntent } from "../components/WorkoutIntent";
import { useMovements } from "../hooks/useExercises";
import { useGenerateWod } from "../hooks/useWod";
import { useAuth } from "../hooks/useAuth";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { useAnonGenerationLimit } from "../hooks/useAnonGenerationLimit";
import { AnonLimitDialog } from "../components/auth/AnonLimitDialog";
import { computeCurrentWorkoutStreak } from "@/utils/workoutStreak";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import type { WeightUnit } from "../components/UnitSelector";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { workouts, isLoading: historyLoading } = useWorkoutHistory();
  const streak = useMemo(
    () => (isAuthenticated ? computeCurrentWorkoutStreak(workouts) : null),
    [isAuthenticated, workouts],
  );
  const { selectedMovements, toggleMovement, movementUsageMode, setMovementUsageMode } = useMovements();
  const [workoutType, setWorkoutType] = useState<WorkoutType>("random");
  const [formatType, setFormatType] = useState<FormatType>("emom");
  const { weightUnit, setWeightUnit } = useWeightUnit();
  const [workoutLength, setWorkoutLength] =
    useState<WorkoutLengthOption>("medium");
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [workoutIntent, setWorkoutIntent] = useState<WorkoutIntent>("general_fitness");
  const [fetchWod, { wod, timing, confidence, isLoading, error, workoutResponse, savedWorkoutId, isFavorite, toggleFavorite }] =
    useGenerateWod();
  const {
    remaining: anonRemaining,
    limit: anonLimit,
    limitReached: anonLimitReached,
    recordGeneration,
  } = useAnonGenerationLimit();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const handleGenerateWod = async () => {
    if (anonLimitReached) {
      setShowLimitDialog(true);
      return;
    }
    const success = await fetchWod(
      workoutType === "random",
      selectedMovements,
      formatType,
      weightUnit,
      workoutLength,
      customMinutes,
      workoutIntent,
      movementUsageMode,
    );
    if (success) {
      recordGeneration();
    }
  };

  const handleWorkoutChange = (type: WorkoutType) => {
    if (!type) return;
    setWorkoutType(type);
  };

  const handleFormatChange = (type: FormatType) => {
    if (!type) return;
    setFormatType(type);
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
    <>
      <AnonLimitDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
      />
      {/* Mobile Layout: Vertical Stack */}
      <div className="lg:hidden flex flex-col items-center">
        <div className="w-full max-w-lg">
          <FancyLoadingSpinner isLoading={isLoading}>
            <MainMenu
              isLoading={isLoading}
              workoutType={workoutType}
              formatType={formatType}
              weightUnit={weightUnit}
              workoutLength={workoutLength}
              customMinutes={customMinutes}
              workoutIntent={workoutIntent}
              selectedMovements={selectedMovements}
              movementUsageMode={movementUsageMode}
              handleGenerateWod={handleGenerateWod}
              setWorkoutType={handleWorkoutChange}
              setFormatType={handleFormatChange}
              setWeightUnit={handleWeightUnitChange}
              setWorkoutLength={handleWorkoutLengthChange}
              setCustomMinutes={handleCustomMinutesChange}
              setWorkoutIntent={handleWorkoutIntentChange}
              setMovementUsageMode={setMovementUsageMode}
              toggleMovement={toggleMovement}
              streak={isAuthenticated ? streak : null}
              streakLoading={isAuthenticated && historyLoading}
              anonRemaining={!isAuthenticated ? anonRemaining : null}
              anonLimit={anonLimit}
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
            workoutResponse={workoutResponse}
            savedWorkoutId={savedWorkoutId}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
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
              weightUnit={weightUnit}
              workoutLength={workoutLength}
              customMinutes={customMinutes}
              workoutIntent={workoutIntent}
              selectedMovements={selectedMovements}
              movementUsageMode={movementUsageMode}
              handleGenerateWod={handleGenerateWod}
              setWorkoutType={handleWorkoutChange}
              setFormatType={handleFormatChange}
              setWeightUnit={handleWeightUnitChange}
              setWorkoutLength={handleWorkoutLengthChange}
              setCustomMinutes={handleCustomMinutesChange}
              setWorkoutIntent={handleWorkoutIntentChange}
              setMovementUsageMode={setMovementUsageMode}
              toggleMovement={toggleMovement}
              streak={isAuthenticated ? streak : null}
              streakLoading={isAuthenticated && historyLoading}
              anonRemaining={!isAuthenticated ? anonRemaining : null}
              anonLimit={anonLimit}
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
              workoutResponse={workoutResponse}
              savedWorkoutId={savedWorkoutId}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          )}
        </section>
      </div>
    </>
  );
}