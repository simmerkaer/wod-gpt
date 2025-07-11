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
  error: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({
  wod,
  timing,
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
          {/* Timer Section - Always visible above workout */}
          {timing && (
            <div className="w-full max-w-2xl mb-8">
              <Timer
                key={`${timing.type}-${timing.duration}-${wod?.slice(0, 50)}`}
                type={timing.type === 'none' ? 'countdown' : timing.type}
                initialMinutes={timing.duration}
                intervalMinutes={
                  timing.intervals?.work === 1 ? 1 : // EMOM case
                  (timing.intervals?.work || 0) + (timing.intervals?.rest || 0) // Interval case (work + rest)
                }
                workoutText={wod || ''}
                onFinish={() => {
                  console.log('Workout timer finished!');
                }}
              />
            </div>
          )}
          
          <div className="flex justify-center">
            <div className="text-left">
              <Typewriter text={wod} />
            </div>
          </div>
          <div className="mt-10 flex justify-center gap-2">
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
          <DialogContent className="max-w-none w-screen h-screen p-0 bg-white dark:bg-gray-900 left-0 top-0 translate-x-0 translate-y-0 border-0 rounded-none">
            <div className="flex flex-col h-screen overflow-hidden">
              {/* Timer Section - Fixed at top */}
              {timing && (
                <div className="flex-shrink-0 w-full p-8 pb-4">
                  <div className="max-w-2xl mx-auto">
                    <Timer
                      key={`${timing.type}-${timing.duration}-${wod?.slice(0, 50)}`}
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
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex-shrink-0 w-full px-8 pb-4">
                  <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-red-700 dark:text-red-300 text-center">
                      ⚠️ {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Workout Text Section - Scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
                <div className="max-w-4xl mx-auto">
                  <pre className="text-xl text-left text-wrap leading-relaxed whitespace-pre-wrap">
                    {wod}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
};

export default GeneratedWod;
