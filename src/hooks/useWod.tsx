import { FormatType } from "@/components/FormatSelector";
import { WorkoutFormat } from "@/components/SpecificFormatSelector";
import { useState } from "react";

export const useGenerateWod = (): [
  (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    workoutFormat?: WorkoutFormat,
  ) => void,
  boolean,
  string | null,
] => {
  const [wod, setWod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchWod = (
    random: boolean,
    exercises: string[],
    formatType: FormatType,
    workoutFormat?: WorkoutFormat,
  ) => {
    setIsLoading(true);
    const requestBody = {
      random: random,
      exercises: exercises,
      formatType: formatType,
      workoutFormat: workoutFormat,
    };

    fetch("/api/generateWod", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((body) => {
        setWod(body);
      })
      .finally(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching WOD data:", error);
      });
  };

  return [fetchWod, isLoading, wod];
};
