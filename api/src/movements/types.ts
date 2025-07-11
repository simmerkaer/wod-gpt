export type MovementId =
  // Bodyweight Movements
  | "burpee"
  | "pushup"
  | "pullup"
  | "sit_up"
  | "air_squat"
  | "handstand_pushup"
  | "handstand_walk"
  | "pistol_squat"
  | "toes_to_bar"
  | "knee_to_elbow"
  | "dip"
  // Weightlifting Movements
  | "deadlift"
  | "thruster"
  | "squat_back_front_overhead"
  | "power_clean"
  | "squat_clean"
  | "clean_and_jerk"
  | "snatch_power_and_squat"
  | "overhead_press"
  | "push_press"
  | "push_jerk"
  | "split_jerk"
  | "sumo_deadlift_high_pull"
  // Kettlebell Movements
  | "kettlebell_swing"
  | "kettlebell_snatch"
  | "kettlebell_clean"
  | "kettlebell_deadlift"
  | "kettlebell_thruster"
  | "kettlebell_goblet_squat"
  | "kettlebell_turkish_get_up"
  // Gymnastics Movements
  | "rope_climb"
  | "l_sit"
  | "skin_the_cat"
  | "ring_row"
  | "ring_muscle_up"
  | "bar_muscle_up"
  | "ghd_sit_up"
  | "ghd_hip_extension"
  // Box Movements
  | "box_jump"
  | "box_step_up"
  | "box_over"
  // Cardio Movements
  | "running"
  | "rowing"
  | "double_under"
  | "single_under"
  | "assault_bike"
  | "ski_erg"
  | "bike_erg"
  // Odd Object Movements
  | "sandbag_carry"
  | "yoke_carry"
  | "sled_push"
  | "sled_drag"
  | "farmer_carry"
  | "atlas_stone_lift"
  | "tire_flip"
  // Wall Ball Movements
  | "wall_ball_shot"
  | "wall_walk"
  // Dumbbell Movements
  | "dumbbell_snatch"
  | "dumbbell_thruster"
  | "dumbbell_clean"
  | "dumbbell_deadlift"
  | "dumbbell_shoulder_press"
  | "dumbbell_push_press"
  | "dumbbell_overhead_walking_lunge"
  // Other Functional Movements
  | "bear_crawl"
  | "burpee_box_jump_over"
  | "devils_press";

export type FormatType = "random" | "specific";

export type WorkoutFormat =
  | "amrap"
  | "emom"
  | "for_time"
  | "intervals"
  | "chipper"
  | "strength_metcon";

export type WeightUnit = "kg" | "lbs";

export type WorkoutIntent = 
  | "strength"
  | "endurance" 
  | "fat_loss"
  | "skill_development"
  | "recovery"
  | "general_fitness"
  | "competition_prep";
