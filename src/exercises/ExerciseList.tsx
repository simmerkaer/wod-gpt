import * as React from "react";

interface ExerciseListProps {
  exercises: string[];
  selectedExercises: string[];
  setSelectedExercises: (exercises: string[]) => void;
}

const ExerciseList: React.FunctionComponent<ExerciseListProps> = ({
  exercises,
  selectedExercises,
  setSelectedExercises,
}) => {
  const toggleSelectedExercise = (exercise: string) => {
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(selectedExercises.filter((x) => x !== exercise));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  return (
    <div className="flex flex-wrap space-x-2 m-2">
      {exercises.map((x) => (
        <div
          key={x}
          className={`p-2 rounded cursor-pointer ${
            selectedExercises.includes(x) ? "bg-green-500 text-white" : ""
          }`}
          onClick={() => toggleSelectedExercise(x)}
        >
          {x}
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
