import { useState } from "react";
import "./App.css";
import ExerciseList from "./exercises/ExerciseList";
import { useExercises } from "./hooks/useExercises";
import GeneratedWod from "./wod/GeneratedWod";
import { Button } from "@/components/ui/button";

function App() {
  const exercises = useExercises();
  const [selectedExercises, setSelectedExercises] =
    useState<string[]>(exercises);

  const [showWod, setShowWod] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <Button onClick={() => setShowWod(true)}>Generate WOD</Button>
      <ExerciseList
        exercises={exercises}
        selectedExercises={selectedExercises}
        setSelectedExercises={setSelectedExercises}
      />
      {showWod && <GeneratedWod exercises={selectedExercises} timeframe={30} />}
    </div>
  );
}

export default App;
