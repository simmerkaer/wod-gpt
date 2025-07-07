import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Expand } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Typewriter } from "./Typewriter";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

interface GeneratedWodProps {
  wod: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({ wod }) => {
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  if (wod)
    return (
      <>
        <div>
          <Typewriter text={wod} />
          <div className="mt-10 flex gap-4">
            <Button
              id="gtm-generate-wod"
              variant="outline"
              onClick={copyToClipboard}
            >
              <ClipboardCopy />
              Copy workout to clipboard
            </Button>
            <Button
              variant="outline"
              onClick={toggleFullScreen}
            >
              <Expand />
              Full Screen
            </Button>
          </div>
        </div>

        <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
          <DialogContent className="max-w-none w-full h-full p-8 bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="max-w-4xl w-full text-center">
                <pre className="text-2xl text-left text-wrap">
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
