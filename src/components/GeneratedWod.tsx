import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Expand } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Typewriter } from "./Typewriter";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Timer } from "./Timer";
import { WorkoutTiming } from "@/types/workout";

interface GeneratedWodProps {
  wod: string | null;
  timing: WorkoutTiming | null;
  confidence: number;
  source: "ai" | "parsed" | "default";
  error: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({
  wod,
  timing,
  confidence,
  source,
  error,
}) => {
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const workoutRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    toast({
      title: "Workout copied to clipboard 📋💪",
    });
    navigator.clipboard.writeText(wod || "");
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  // Smooth scroll to workout when generated
  useEffect(() => {
    if (wod && workoutRef.current) {
      workoutRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [wod]);

  if (wod)
    return (
      <>
        <div ref={workoutRef}>
          <Typewriter text={wod} />
          <div className="mt-10 flex gap-2">
            <Button
              id="gtm-generate-wod"
              variant="outline"
              onClick={copyToClipboard}
            >
              <ClipboardCopy />
              Copy workout to clipboard
            </Button>
            <Button variant="outline" onClick={toggleFullScreen}>
              <Expand />
              Full Screen
            </Button>
          </div>
        </div>

        <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
          <DialogContent className="max-w-none w-full h-full p-8 bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {/* Timer Section */}
              {timing && (
                <div className="w-full max-w-2xl">
                  <Timer
                    type={timing.type === "none" ? "countdown" : timing.type}
                    initialMinutes={timing.duration}
                    intervalMinutes={
                      timing.intervals?.work === 1
                        ? 1 // EMOM case
                        : (timing.intervals?.work || 0) +
                          (timing.intervals?.rest || 0) // Interval case (work + rest)
                    }
                    workoutText={wod || ""}
                    onFinish={() => {
                      console.log("Workout timer finished!");
                    }}
                  />

                  {/* Timer Quality Indicator */}
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {timing.description}
                      {confidence < 0.8 && (
                        <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                          ⚠️ Timer may need adjustment
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="w-full max-w-2xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-red-700 dark:text-red-300 text-center">
                    ⚠️ {error}
                  </div>
                </div>
              )}

              {/* Workout Text Section */}
              <div className="max-w-4xl w-full text-center flex-1 overflow-y-auto">
                <pre className="text-xl text-left text-wrap leading-relaxed">
                  {wod}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
};

export default GeneratedWod;
