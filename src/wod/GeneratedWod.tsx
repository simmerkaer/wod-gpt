import React from "react";
import { useWod } from "../hooks/useWod";

interface GeneratedWodProps {
  exercises: string[];
  timeframe: number;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({
  exercises,
  timeframe,
}) => {
  const wod = useWod(exercises, timeframe);
  return (
    <>
      <div className="p-4">
        <pre>{wod}</pre>
      </div>
    </>
  );
};

export default GeneratedWod;
