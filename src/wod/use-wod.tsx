import { useState, useEffect } from "react";

export const useWod = (): string | null => {
  const [data, setData] = useState<string | null>("test wod");

  //   useEffect(() => {
  //     fetch("/api/wod")
  //       .then((res) => res.text())
  //       .then((text) => setData(text))
  //       .catch((error) => {
  //         console.error("Error fetching WOD data:", error);
  //       });
  //   }, []);

  return data;
};
