import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { useSubscription } from "../hooks/useSubscription";
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
  const [fetchWod, { wod, timing, confidence, isLoading, error, workoutResponse, savedWorkoutId, isCompleted, toggleCompleted }] =
    useGenerateWod();
  const {
    isSubscribed,
    remainingToday,
    dailyLimit: serverDailyLimit,
    limitReached: freeLimitReached,
    refresh: refreshSubscription,
    pollUntilSubscribed,
    subscribe,
    actionPending: subscribePending,
  } = useSubscription();
  // Non-subscribers (logged in or not) get the locked free-tier experience:
  // random format, default intent and length. The API enforces this too.
  const effectiveFormatType: FormatType = isSubscribed ? formatType : "random";
  const { toast } = useToast();

  // Handle return from Stripe Checkout. The webhook that flips us to
  // "active" can land a moment after the browser is redirected back, so we
  // poll the status endpoint until it confirms — otherwise the user briefly
  // sees the free-plan UI and gets confused.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const subscribed = params.get("subscribed");
    if (!subscribed) return;

    // Clean the URL so a refresh doesn't re-run this.
    params.delete("subscribed");
    params.delete("session_id");
    const cleanQuery = params.toString();
    const cleanUrl =
      window.location.pathname + (cleanQuery ? `?${cleanQuery}` : "");
    window.history.replaceState({}, "", cleanUrl);

    if (subscribed === "1") {
      void (async () => {
        const ok = await pollUntilSubscribed();
        if (ok) {
          toast({
            title: "Subscription active",
            description: "You now have unlimited workout generation.",
          });
        } else {
          toast({
            title: "Subscription is still processing",
            description: "Refresh in a moment if it doesn't show up.",
          });
        }
      })();
    } else if (subscribed === "0") {
      toast({
        title: "Subscription not completed",
        description: "Feel free to try again any time.",
      });
    }
  }, [pollUntilSubscribed, toast]);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // The server tracks the free allowance for everyone — by user id when
  // logged in, by hashed IP when anonymous.
  const displayedRemaining = isSubscribed ? null : remainingToday;
  const displayedLimit = serverDailyLimit ?? 1;
  const showRemainingMeter = !isSubscribed;

  const handleGenerateWod = async () => {
    if (freeLimitReached) {
      setShowLimitDialog(true);
      return;
    }
    const outcome = await fetchWod(
      workoutType === "random",
      selectedMovements,
      effectiveFormatType,
      weightUnit,
      workoutLength,
      customMinutes,
      workoutIntent,
      movementUsageMode,
    );
    // Keep the meter in sync with the server after every attempt.
    refreshSubscription();
    if (outcome.limitReached) {
      // Server rejected the request because the daily cap was reached
      // (race condition: our cached state said remaining > 0 but the
      // server disagreed).
      setShowLimitDialog(true);
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
              formatType={effectiveFormatType}
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
              freeRemaining={showRemainingMeter ? displayedRemaining : null}
              freeLimit={displayedLimit}
              customizationLocked={!isSubscribed}
              onSubscribe={subscribe}
              subscribePending={subscribePending}
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
            isCompleted={isCompleted}
            toggleCompleted={toggleCompleted}
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
              formatType={effectiveFormatType}
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
              freeRemaining={showRemainingMeter ? displayedRemaining : null}
              freeLimit={displayedLimit}
              customizationLocked={!isSubscribed}
              onSubscribe={subscribe}
              subscribePending={subscribePending}
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
              isCompleted={isCompleted}
              toggleCompleted={toggleCompleted}
            />
          )}
        </section>
      </div>
    </>
  );
}