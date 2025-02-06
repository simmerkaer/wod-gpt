import { MovementId } from "./movementId";

export type MovementCatergory =
  | "bodyweight"
  | "weightlifting"
  | "kettlebell"
  | "gymnastics"
  | "box"
  | "cardio"
  | "odd_object"
  | "wall_ball"
  | "dumbbell"
  | "other_functional";

export interface Movement {
  id: MovementId;
  name: string;
  category: MovementCatergory;
}

const movements: Movement[] = [
  // Bodyweight Movements
  { id: "burpee", name: "burpees", category: "bodyweight" },
  { id: "pushup", name: "pushups", category: "bodyweight" },
  { id: "pullup", name: "pullups", category: "bodyweight" },
  { id: "sit_up", name: "sit-ups", category: "bodyweight" },
  { id: "air_squat", name: "air squats", category: "bodyweight" },
  { id: "handstand_pushup", name: "handstand pushups", category: "bodyweight" },
  { id: "pistol_squat", name: "pistol squats", category: "bodyweight" },
  { id: "toes_to_bar", name: "toes-to-bar", category: "bodyweight" },
  { id: "knee_to_elbow", name: "knees-to-elbows", category: "bodyweight" },
  { id: "dip", name: "dips", category: "bodyweight" },

  // Weightlifting Movements
  { id: "deadlift", name: "deadlifts", category: "weightlifting" },
  { id: "thruster", name: "thrusters", category: "weightlifting" },
  {
    id: "squat_back_front_overhead",
    name: "squats (back, front, overhead)",
    category: "weightlifting",
  },
  { id: "power_clean", name: "power cleans", category: "weightlifting" },
  { id: "squat_clean", name: "squat cleans", category: "weightlifting" },
  { id: "clean_and_jerk", name: "clean and jerks", category: "weightlifting" },
  {
    id: "snatch_power_and_squat",
    name: "snatches (power and squat)",
    category: "weightlifting",
  },
  { id: "overhead_press", name: "overhead press", category: "weightlifting" },
  { id: "push_press", name: "push press", category: "weightlifting" },
  { id: "push_jerk", name: "push jerk", category: "weightlifting" },
  { id: "split_jerk", name: "split jerk", category: "weightlifting" },
  {
    id: "sumo_deadlift_high_pull",
    name: "sumo deadlift high pull",
    category: "weightlifting",
  },

  // Kettlebell Movements
  { id: "kettlebell_swing", name: "kettlebell swings", category: "kettlebell" },
  {
    id: "kettlebell_snatch",
    name: "kettlebell snatches",
    category: "kettlebell",
  },
  { id: "kettlebell_clean", name: "kettlebell cleans", category: "kettlebell" },
  {
    id: "kettlebell_deadlift",
    name: "kettlebell deadlifts",
    category: "kettlebell",
  },
  {
    id: "kettlebell_thruster",
    name: "kettlebell thrusters",
    category: "kettlebell",
  },
  {
    id: "kettlebell_goblet_squat",
    name: "kettlebell goblet squats",
    category: "kettlebell",
  },
  {
    id: "kettlebell_turkish_get_up",
    name: "kettlebell Turkish get-ups",
    category: "kettlebell",
  },

  // Gymnastics Movements
  { id: "handstand_walk", name: "handstand walks", category: "gymnastics" },
  {
    id: "bar_muscle_up",
    name: "bar muscle-ups",
    category: "gymnastics",
  },
  {
    id: "ring_muscle_up",
    name: "ring muscle-ups",
    category: "gymnastics",
  },
  { id: "rope_climb", name: "rope climbs", category: "gymnastics" },
  { id: "l_sit", name: "L-sits", category: "gymnastics" },
  { id: "skin_the_cat", name: "skin the cat", category: "gymnastics" },
  { id: "ring_row", name: "ring rows", category: "gymnastics" },
  { id: "ring_muscle_up", name: "ring muscle-ups", category: "gymnastics" },
  { id: "ghd_sit_up", name: "GHD sit-ups", category: "gymnastics" },
  {
    id: "ghd_hip_extension",
    name: "GHD hip extensions",
    category: "gymnastics",
  },

  // Box Movements
  { id: "box_jump", name: "box jumps", category: "box" },
  { id: "box_step_up", name: "box step-ups", category: "box" },
  { id: "box_over", name: "box overs", category: "box" },

  // Cardio Movements
  { id: "running", name: "running", category: "cardio" },
  { id: "rowing", name: "rowing", category: "cardio" },
  { id: "double_under", name: "double-unders", category: "cardio" },
  { id: "single_under", name: "single-unders", category: "cardio" },
  { id: "assault_bike", name: "assault bike", category: "cardio" },
  { id: "ski_erg", name: "ski erg", category: "cardio" },
  { id: "bike_erg", name: "bike erg", category: "cardio" },

  // Odd Object Movements
  { id: "sandbag_carry", name: "sandbag carries", category: "odd_object" },
  { id: "yoke_carry", name: "yoke carries", category: "odd_object" },
  { id: "sled_push", name: "sled pushes", category: "odd_object" },
  { id: "sled_drag", name: "sled drags", category: "odd_object" },
  { id: "farmer_carry", name: "farmer carries", category: "odd_object" },
  { id: "atlas_stone_lift", name: "atlas stone lifts", category: "odd_object" },

  // Wall Ball Movements
  { id: "wall_ball_shot", name: "wall ball shots", category: "wall_ball" },
  { id: "wall_walk", name: "wall walks", category: "wall_ball" },

  // Dumbbell Movements
  { id: "dumbbell_snatch", name: "dumbbell snatches", category: "dumbbell" },
  { id: "dumbbell_thruster", name: "dumbbell thrusters", category: "dumbbell" },
  { id: "dumbbell_clean", name: "dumbbell cleans", category: "dumbbell" },
  { id: "dumbbell_deadlift", name: "dumbbell deadlifts", category: "dumbbell" },
  {
    id: "dumbbell_shoulder_press",
    name: "dumbbell shoulder press",
    category: "dumbbell",
  },
  {
    id: "dumbbell_push_press",
    name: "dumbbell push press",
    category: "dumbbell",
  },
  {
    id: "dumbbell_overhead_walking_lunge",
    name: "dumbbell overhead walking lunges",
    category: "dumbbell",
  },

  // Other Functional Movements
  { id: "bear_crawl", name: "bear crawl", category: "other_functional" },
  {
    id: "burpee_box_jump_over",
    name: "burpee box jump overs",
    category: "other_functional",
  },
  { id: "devils_press", name: "devil's press", category: "other_functional" },
];

export default movements;
