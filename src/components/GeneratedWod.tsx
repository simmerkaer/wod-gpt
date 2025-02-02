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
  return <pre className="text-left p-10 xl:w-300">{wod}</pre>;
};

export default GeneratedWod;
