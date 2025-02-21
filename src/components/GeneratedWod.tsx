import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy } from "lucide-react";
import React from "react";
import { Typewriter } from "./Typewriter";
import { Button } from "./ui/button";

interface GeneratedWodProps {
  wod: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({ wod }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    toast({
      title: "Workout copied to clipboard 📋💪",
    });
    navigator.clipboard.writeText(wod || "");
  };

  if (wod)
    return (
      <div>
        <Typewriter text={wod} />
        <Button variant="outline" onClick={copyToClipboard} className="mt-10">
          <ClipboardCopy />
          Copy workout to clipboard
        </Button>
      </div>
    );
};

export default GeneratedWod;
