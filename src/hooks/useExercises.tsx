import { useState } from "react";

export const useExercises = () => {
  const [selectedMovements, setSelectedMovements] = useState<string[]>([
    "burpees",
    "pullups",
    "thrusters",
    "bike erg",
    "double-unders",
    "power cleans",
  ]);

  const toggleMovement = (movement: string) => {
    setSelectedMovements((prevSelected) =>
      prevSelected.includes(movement)
        ? prevSelected.filter((m) => m !== movement)
        : [...prevSelected, movement],
    );
  };

  return {
    bodyweightMovements: [
      "burpees",
      "pushups",
      "pullups",
      "sit-ups",
      "air squats",
      "handstand pushups",
      "handstand walks",
      "pistol squats",
      "toes-to-bar",
      "knees-to-elbows",
      "muscle-ups (bar and rings)",
      "dips",
    ],

    weightliftingMovements: [
      "deadlifts",
      "thrusters",
      "squats (back, front, overhead)",
      "power cleans",
      "squat cleans",
      "clean and jerks",
      "snatches (power and squat)",
      "overhead press",
      "push press",
      "push jerk",
      "split jerk",
      "sumo deadlift high pull",
    ],

    kettlebellMovements: [
      "kettlebell swings",
      "kettlebell snatches",
      "kettlebell cleans",
      "kettlebell deadlifts",
      "kettlebell thrusters",
      "kettlebell goblet squats",
      "kettlebell Turkish get-ups",
    ],

    gymnasticsMovements: [
      "rope climbs",
      "L-sits",
      "skin the cat",
      "ring rows",
      "ring muscle-ups",
      "GHD sit-ups",
      "GHD hip extensions",
    ],

    boxMovements: ["box jumps", "box step-ups", "box overs"],

    cardioMovements: [
      "running",
      "rowing",
      "double-unders",
      "single-unders",
      "assault bike",
      "ski erg",
      "bike erg",
    ],

    oddObjectMovements: [
      "sandbag carries",
      "yoke carries",
      "sled pushes",
      "sled drags",
      "farmer carries",
      "atlas stone lifts",
    ],

    wallBallMovements: ["wall ball shots", "wall walks"],

    dumbbellMovements: [
      "dumbbell snatches",
      "dumbbell thrusters",
      "dumbbell cleans",
      "dumbbell deadlifts",
      "dumbbell shoulder press",
      "dumbbell push press",
      "dumbbell overhead walking lunges",
    ],

    otherFunctionalMovements: [
      "bear crawl",
      "burpee box jump overs",
      "devil's press",
    ],

    selectedMovements,
    toggleMovement,
  };
};
