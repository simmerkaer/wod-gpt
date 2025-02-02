import { useState } from "react";
import "./App.css";
import ExerciseList from "./components/ExerciseList";
import { useExercises } from "./hooks/useExercises";
import GeneratedWod from "./components/GeneratedWod";
import TimeFrame from "./components/TimeFrame";
import { useWod } from "./hooks/useWod";

function App() {
  const { selectedMovements, toggleMovement, ...movements } = useExercises();
  const [timeFrame, setTimeFrame] = useState(30);
  const [showWod, setShowWod] = useState(false);
  const [fetchWod, isLoading, wod] = useWod();

  const handleGenerateWod = () => {
    fetchWod(selectedMovements, timeFrame);
    setShowWod(true);
  };

  return (
    <div className="flex flex-row space-x-2">
      <div className="basis-1/3">
        <TimeFrame
          timeFrame={timeFrame}
          isLoading={isLoading}
          setTimeFrame={setTimeFrame}
          handleGenerateWod={handleGenerateWod}
        />
        <GeneratedWod wod={wod} />
      </div>
      <div className="basis-2/3">
        <ExerciseList
          movements={movements}
          selectedMovements={selectedMovements}
          handleToggleMovement={toggleMovement}
        />
      </div>
    </div>
  );
}

export default App;
