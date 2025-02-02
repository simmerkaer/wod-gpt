import { useState } from "react";
import "./App.css";
import ExerciseList from "./components/ExerciseList";
import { useExercises } from "./hooks/useExercises";
import GeneratedWod from "./components/GeneratedWod";
import TimeFrame from "./components/TimeFrame";

function App() {
  const { selectedMovements, toggleMovement, ...movements } = useExercises();
  const [timeFrame, setTimeFrame] = useState(30);
  const [showWod, setShowWod] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row space-x-2">
        <TimeFrame
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          handleGenerateWod={() => setShowWod(true)}
        >
          {showWod && (
            <GeneratedWod exercises={selectedMovements} timeframe={timeFrame} />
          )}
        </TimeFrame>
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
