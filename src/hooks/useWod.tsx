import { useEffect, useState } from "react";

export const useWod = (
  exercises: string[],
  timeframe: number,
): string | null => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const requestBody = {
      exercises: exercises,
      timeframe: timeframe,
    };

    fetch("/api/wod", {
      method: "POST", // Change to POST to send a request body
      headers: {
        "Content-Type": "application/json", // Ensure the header specifies JSON
      },
      body: JSON.stringify(requestBody), // Send the JSON body
    })
      .then((res) => res.text())
      .then((text) => setData(text))
      .catch((error) => {
        console.error("Error fetching WOD data:", error);
      });
  }, []);

  return data;
};
