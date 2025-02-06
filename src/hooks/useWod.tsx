import { useState } from "react";

export const useGenerateWod = (): [
  (random: boolean, exercises: string[], timeframe: number) => void,
  boolean,
  string | null,
] => {
  const [wod, setWod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchWod = (
    random: boolean,
    exercises: string[],
    timeframe: number,
  ) => {
    setIsLoading(true);
    const requestBody = {
      random: random,
      exercises: exercises,
      timeframe: timeframe,
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
