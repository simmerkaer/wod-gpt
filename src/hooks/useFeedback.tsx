import { useState } from "react";

export const useFeedback = (): [
  (user: string, feedback: string) => void,
  boolean,
] => {
  const [isLoading, setIsLoading] = useState(false);
  const giveFeedback = (email: string, feedback: string) => {
    setIsLoading(true);
    const requestBody = {
      email,
      feedback,
    };

    fetch("/api/giveFeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.text())
      .finally(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching WOD data:", error);
      });
  };

  return [giveFeedback, isLoading];
};
