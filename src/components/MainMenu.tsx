import { MovementId, MovementUsageMode } from "@/lib/movementId";
import {
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Lock,
  LogIn,
  LucideIcon,
  PlusIcon,
  Scale,
  Sparkles,
  Target,
  ZapIcon,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FormatSelector, { FormatType } from "./FormatSelector";
import GiveFeedback from "./GiveFeedback";
import SelectedMovements from "./SelectedMovements";
import SelectMovements from "./SelectMovements";
import { badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import UnitSelector, { WeightUnit } from "./UnitSelector";
import WorkoutIntentSelector, { WorkoutIntent } from "./WorkoutIntent";
import WorkoutLength, { WorkoutLengthOption } from "./WorkoutLength";
import WorkoutSelector, { WorkoutType } from "./WorkoutSelector";

interface MainMenuProps {
  isLoading: boolean;
  workoutType: WorkoutType;
  formatType: FormatType;
  weightUnit: WeightUnit;
  workoutLength: WorkoutLengthOption;
  customMinutes: number;
  workoutIntent: WorkoutIntent;
  selectedMovements: MovementId[];
  movementUsageMode: MovementUsageMode;
  toggleMovement: (movement: MovementId) => void;
  setWorkoutType: (workoutType: WorkoutType) => void;
  setFormatType: (formatType: FormatType) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  setWorkoutLength: (workoutLength: WorkoutLengthOption) => void;
  setCustomMinutes: (minutes: number) => void;
  setWorkoutIntent: (workoutIntent: WorkoutIntent) => void;
  setMovementUsageMode: (mode: MovementUsageMode) => void;
  handleGenerateWod: () => void;
  /** When logged in; null while history loading */
  streak?: number | null;
  streakLoading?: boolean;
  /** Remaining free generations today (anonymous or logged-in non-subscriber);
   *  null when the meter should be hidden (subscribers). */
  freeRemaining?: number | null;
  freeLimit?: number;
  /** True for non-subscribers: format, intent and length selectors are locked. */
  customizationLocked?: boolean;
  /** Starts Stripe Checkout; shown in the free-tier banner for logged-in users. */
  onSubscribe?: () => void;
  subscribePending?: boolean;
}

const SectionHeading: React.FunctionComponent<{
  icon: LucideIcon;
  label: string;
  locked?: boolean;
}> = ({ icon: Icon, label, locked = false }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px bg-border"></div>
    <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground whitespace-nowrap px-2">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
      {locked && (
        <Lock className="h-3 w-3 opacity-70" aria-label="Subscribers only" />
      )}
    </h3>
    <div className="flex-1 h-px bg-border"></div>
  </div>
);

const MainMenu: React.FunctionComponent<MainMenuProps> = ({
  isLoading,
  workoutType,
  formatType,
  weightUnit,
  workoutLength,
  customMinutes,
  workoutIntent,
  selectedMovements,
  movementUsageMode,
  toggleMovement,
  setWorkoutType,
  setFormatType,
  setWeightUnit,
  setWorkoutLength,
  setCustomMinutes,
  setWorkoutIntent,
  setMovementUsageMode,
  handleGenerateWod,
  streak = null,
  streakLoading = false,
  freeRemaining = null,
  freeLimit,
  customizationLocked = true,
  onSubscribe,
  subscribePending = false,
}) => {
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  return (
    <Card className="flex-grow rounded-[10px]">
      <CardHeader className="pb-4">
        <CardTitle>
          <p className="text-4xl bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent pb-2 font-extralight">
            wod-gpt
          </p>
        </CardTitle>
        <CardDescription>AI-powered CrossFit workouts</CardDescription>
        {!isAuthenticated && (
          <div
            className="mt-3 rounded-lg border border-primary/20 bg-muted/50 px-3 py-2.5 text-left text-sm dark:bg-muted/30"
            role="region"
            aria-label="Sign in benefits"
          >
            <p className="text-muted-foreground leading-snug">
              <strong className="text-foreground">Create an account</strong> to
              save workouts, view history, mark workouts completed, and track
              your weekly streak.
            </p>
            {freeRemaining !== null && freeLimit !== undefined && (
              <p
                className="mt-1.5 text-xs font-medium text-muted-foreground"
                aria-live="polite"
              >
                {freeRemaining > 0 ? (
                  <>
                    {freeRemaining} of {freeLimit} free workout
                    {freeLimit === 1 ? "" : "s"} left today
                  </>
                ) : (
                  <>Daily free limit reached — subscribe for unlimited</>
                )}
              </p>
            )}
            <div className="mt-2 md:flex md:justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 md:w-auto"
                onClick={() => login()}
                disabled={authLoading}
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                Sign in or create account
              </Button>
            </div>
          </div>
        )}
        {isAuthenticated && (streakLoading || streak !== null) && (
          <Link
            to="/profile"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm dark:border-orange-900/50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors cursor-pointer no-underline"
            aria-live="polite"
          >
            {streakLoading ? (
              <span className="text-muted-foreground">Loading streak…</span>
            ) : streak !== null && streak > 0 ? (
              <>
                <Flame
                  className="h-5 w-5 shrink-0 text-orange-500"
                  aria-hidden
                />
                <span className="font-semibold text-orange-800 dark:text-orange-200">
                  {streak} week{streak !== 1 ? "s" : ""} streak
                </span>
              </>
            ) : (
              <>
                <Flame
                  className="h-5 w-5 shrink-0 text-muted-foreground opacity-60"
                  aria-hidden
                />
                <span className="text-muted-foreground">
                  Complete a workout this week to start a streak
                </span>
              </>
            )}
          </Link>
        )}
        {isAuthenticated && freeRemaining !== null && freeLimit !== undefined && (
          <div
            className="mt-3 rounded-lg border border-primary/20 bg-muted/50 px-3 py-2.5 text-left text-sm dark:bg-muted/30"
            role="region"
            aria-label="Free plan usage"
          >
            <p
              className="text-xs font-medium text-muted-foreground"
              aria-live="polite"
            >
              {freeRemaining > 0 ? (
                <>
                  {freeRemaining} of {freeLimit} free workout
                  {freeLimit === 1 ? "" : "s"} left today
                </>
              ) : (
                <>Daily free limit reached</>
              )}{" "}
              — subscribe for unlimited workouts and to unlock format, intent
              and length.
            </p>
            {onSubscribe && (
              <div className="mt-2 md:flex md:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 md:w-auto"
                  onClick={onSubscribe}
                  disabled={subscribePending}
                >
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                  {subscribePending ? "Redirecting…" : "Subscribe"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex-grow flex flex-col gap-4">
          {/* Movement Selection Section */}
          <div className="space-y-2">
            <SectionHeading icon={Dumbbell} label="Movement Selection" />
            <WorkoutSelector
              value={workoutType}
              onValueChange={setWorkoutType}
            />
            <SelectedMovements
              show={workoutType === "specified"}
              selectedMovements={selectedMovements}
              addMoreMovementsButton={
                <SelectMovements
                  selectedMovements={selectedMovements}
                  trigger={
                    <button
                      className={badgeVariants({
                        variant: "secondary",
                        className:
                          "rounded-full pr-2 pl-3 py-1.5 gap-1.5 cursor-pointer !text-sm select-none focus:ring-offset-1 hover:ring-1",
                      })}
                    >
                      <PlusIcon className="h-3 w-3 mr-2" /> add movements
                    </button>
                  }
                  toggleMovement={toggleMovement}
                />
              }
              onRemoveMovement={toggleMovement}
            />

            {/* Movement Usage Mode */}
            {workoutType === "specified" && selectedMovements.length > 0 && (
              <div className="mt-3">
                <ToggleGroup
                  type="single"
                  value={movementUsageMode}
                  onValueChange={(value: MovementUsageMode) =>
                    value && setMovementUsageMode(value)
                  }
                  className="justify-center gap-2"
                >
                  <ToggleGroupItem
                    value="some"
                    className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
                  >
                    Use SOME of selected movements
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="all"
                    className="flex items-center gap-2 p-2 h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary"
                  >
                    Use ALL selected movements
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </div>

          {/* Workout Format Section */}
          <div className="space-y-2">
            <SectionHeading
              icon={ZapIcon}
              label="Workout Format"
              locked={customizationLocked}
            />
            <FormatSelector
              value={formatType}
              onValueChange={setFormatType}
              disabled={customizationLocked}
            />
          </div>

          {/* Workout Intent Section */}
          <div className="space-y-2">
            <SectionHeading
              icon={Target}
              label="Workout Intent"
              locked={customizationLocked}
            />
            <WorkoutIntentSelector
              value={workoutIntent}
              onValueChange={setWorkoutIntent}
              disabled={customizationLocked}
            />
          </div>

          {/* Workout Length Section */}
          <div className="space-y-2">
            <SectionHeading
              icon={Clock}
              label="Workout Length"
              locked={customizationLocked}
            />
            <WorkoutLength
              selectedLength={workoutLength}
              customMinutes={customMinutes}
              onLengthChange={setWorkoutLength}
              onCustomMinutesChange={setCustomMinutes}
              disabled={customizationLocked}
            />
          </div>

          {/* Weight Unit Section — desktop only; mobile uses nav menu */}
          <div className="hidden space-y-2 md:block">
            <SectionHeading icon={Scale} label="Weight Units" />
            <UnitSelector value={weightUnit} onValueChange={setWeightUnit} />
          </div>

          {/* Generate Button */}
          <div className="pt-3 space-y-2">
            <Button
              onClick={handleGenerateWod}
              className="w-full bg-gradient-to-r from-red-500 to-purple-600 align-middle hover:from-red-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>Generate WOD</span>
                  <ZapIcon />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex-grow flex flex-col gap-3">
          <Separator className="my-2" />
          <GiveFeedback />
        </div>
      </CardFooter>
    </Card>
  );
};

export default MainMenu;
