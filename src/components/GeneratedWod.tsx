import { ClipboardCopy } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface GeneratedWodProps {
  wod: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({ wod }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(wod || "");
  };

  if (wod)
    return (
      <div>
        <pre className="text-left text-wrap">{wod}</pre>
        <Button variant="outline" onClick={copyToClipboard} className="mt-10">
          <ClipboardCopy />
          Copy workout to clipboard
        </Button>
      </div>
    );
};

export default GeneratedWod;
