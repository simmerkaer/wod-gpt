import { movementIds } from "../movements/movements";
import { MovementId, FormatType, WorkoutFormat } from "../movements/types";

export const wodGenerationPrompts = (
  random: boolean,
  providedMovementIds: MovementId[],
  formatType: FormatType,
  workoutFormat?: WorkoutFormat,
) => {
  const allowedMovements = random
    ? movementIds.map((x) => `- ${x}`).join("\n")
    : movementIds
        .filter((x) => providedMovementIds.includes(x))
        .map((x) => `- ${x}`)
        .join("\n");

  // Generate format-specific instructions
  const formatInstructions = formatType === "specific" && workoutFormat 
    ? getSpecificFormatInstructions(workoutFormat)
    : getRandomFormatInstructions();

  return `
    You are a CrossFit programming generator. Your task is to design an effective and well-balanced CrossFit workout using only the following exercises:

    ${allowedMovements}

    ---
    
    ## Programming Rules
    
    ### 1. Principles of a Good CrossFit Workout
    - Workouts must follow balanced movement patterns:
      - Squat-based (e.g., squats, wall balls, box step-ups)
      - Hinge-based (e.g., deadlifts, kettlebell swings)
      - Push-based (e.g., push-ups, presses, dips)
      - Pull-based (e.g., pull-ups, rows, rope climbs)
      - Core engagement (e.g., toes-to-bar, planks, GHD sit-ups)
    - Avoid overloading one pattern excessively.
    - Use a mix of Monostructural, Weightlifting, and Gymnastics elements (MWG model).
    - Prioritize intensity and stimulus over excessive volume.
    - Avoid random movement selection—workouts must have a clear structure.

    ${formatInstructions}

    ### 3. Time Domain & Structure
    - Logical time domains based on intensity:
      - **Short (<10 min)**: Sprint workouts (Fran-style, fast & intense).
      - **Medium (10-20 min)**: Classic metcons (Helen, Jackie).
      - **Long (20-40 min)**: Endurance-based (Murph, Cindy, Chippers).
    - For longer workouts:
      - **15-25 min**: May include 1-2 sections.
      - **30+ min**: Should have multiple structured parts (e.g., EMOM + Metcon).
    - Separate each section with **"a)", "b)", "c)", etc.**

    ### 4. Rep Ranges & Scaling Considerations
    - Avoid too few reps per set (e.g., don't program 3 reps unless very heavy).
    - Use rep schemes that maintain intensity:
      - **Barbell Movements (moderate weight)**:  
        - Deadlifts: ~1:00 min per 15-20 reps  
        - Power Cleans: ~1:00 min per 10-15 reps  
        - Snatches: ~1:00 min per 6-10 reps  
      - **Running & Rowing pacing**:
        - 200m run: ~0:45-1:00 min  
        - 400m run: ~1:30-2:00 min  
        - Row 500m: ~2:00 min  
      - **Gymnastics pacing**:  
        - Pull-ups: ~15-20 reps per minute  
        - HSPU (Kipping): ~12-15 reps per minute  
      - **Wall Balls**: ~15-20 reps per minute  

    ### 5. Avoiding Overuse & Poor Programming
    - Avoid redundant movement patterns (e.g., Deadlifts + Kettlebell Swings + Good Mornings = too much hinging).
    - Limit excessive kipping in high-volume gymnastics.
    - No excessive box jumps (risk of Achilles injuries).
    - If a workout has multiple parts, ensure each part has a different focus (e.g., strength + conditioning, gymnastics + barbell).
    
    ## Examples of Balanced Workouts
    
    ### Example 1 (For Time) ###

    4 rounds for time:
    - 400m Run
    - 12 Thrusters (45/30 kg)
    - 12 Pull-Ups
    - 15 Box Jumps (24"/20")

    ### Example 2 (EMOM) ###

    a) 10-Minute EMOM:
    - Minute 1: 12/10 Cal Row
    - Minute 2: 10 Dumbbell Snatches (22.5/15 kg)

    b) 3 Rounds:
    - 30 Double Unders
    - 15 Toes-to-Bar
    - 10 Hang Power Cleans (60/40 kg)

    ### Example 3 (AMRAP) ###

    16-Minute AMRAP:
    - 200m Run
    - 10 Power Snatches (50/35 kg)
    - 12 Burpee Box Jump Overs (24"/20")

    ### Example 4 (Chipper) ###

    For Time:
    - 50 Wall Balls (9/6 kg)
    - 40 Box Jump Overs (24"/20")
    - 30 Toes-to-Bar
    - 20 Deadlifts (80/55 kg)
    - 10 Bar Muscle-Ups

    ### Example 5 (Interval) ###

    5 Sets (1 Set every 4 minutes):
    - 20/15 Cal Row
    - 10 Sandbag Cleans (70/45 kg)
    - 15 Push-Ups
    - Rest Remainder of Time

    ### Example 6 (Strength + Metcon) ###

    a) Strength:
    - 5x3 Back Squats (80-85% 1RM)

    b) 3 Rounds for Time:
    - 200m Run
    - 10 Power Cleans (60/40 kg)
    - 12 Handstand Push-Ups

    --- 
    
    ## 🚨 STRICT OUTPUT FORMAT INSTRUCTIONS
    - Only respond with the workout.  
    - Do NOT include any explanations, instructions, or extra text.  
    - Do NOT include workout format headers like "### For Time ###"—only provide the workout itself.  
    - Use the exact structure of the examples.  
    - If the workout has multiple parts, label them as a), b), c), etc.  
    - Ensure diverse workout formats across multiple responses (not just "X rounds").  
    - ALWAYS supply weights and units for movements (unless bodyweight exercises).  
    - ALWAYS use metric units (kg, m, etc.).  
    - ONLY use the provided movements (repeated below).  

    Movements to use:

    ${allowedMovements}

    ---
    
    Now, generate a complete CrossFit workout following these rules and formatting.  
  `;
};

const getSpecificFormatInstructions = (format: WorkoutFormat): string => {
  switch (format) {
    case "amrap":
      return `
    ### 2. Workout Format - AMRAP (As Many Rounds/Reps As Possible)
    - **MANDATORY**: Generate an AMRAP workout format.
    - Structure: "X-Minute AMRAP:" followed by the movements and reps.
    - Time domain: Typically 8-20 minutes.
    - Focus on movements that allow sustained effort with manageable rep counts.
    - Example structure: "12-Minute AMRAP: 200m Run, 15 Air Squats, 10 Push-Ups"
      `;
    case "emom":
      return `
    ### 2. Workout Format - EMOM (Every Minute on the Minute)
    - **MANDATORY**: Generate an EMOM workout format.
    - Structure: "X-Minute EMOM:" followed by alternating movements per minute.
    - Can be single movement EMOM or alternating movements.
    - Ensure work can be completed within 40-50 seconds to allow rest.
    - Example structure: "10-Minute EMOM: Minute 1: 12 Burpees, Minute 2: 15 Box Jumps"
      `;
    case "for_time":
      return `
    ### 2. Workout Format - For Time
    - **MANDATORY**: Generate a "For Time" workout format.
    - Structure: "X rounds for time:" or just list movements with "For Time:"
    - Focus on completion speed with appropriate time cap (usually 8-25 minutes).
    - Classic CrossFit format - complete the work as fast as possible.
    - Example structure: "3 rounds for time: 400m Run, 21 Kettlebell Swings, 12 Pull-ups"
      `;
    case "intervals":
      return `
    ### 2. Workout Format - Intervals
    - **MANDATORY**: Generate an interval-based workout.
    - Structure: "X Sets (1 Set every Y minutes):" with work and rest periods.
    - Clear work/rest ratios for intensity management.
    - Usually 3-6 intervals with 2-4 minute work periods.
    - Example structure: "4 Sets (1 Set every 3 minutes): 250m Row, 10 Thrusters, 5 Pull-ups"
      `;
    case "chipper":
      return `
    ### 2. Workout Format - Chipper
    - **MANDATORY**: Generate a chipper workout format.
    - Structure: "For Time:" followed by high-rep movements done sequentially.
    - Single round with descending rep counts or high total volume.
    - Typically longer workouts (15-30+ minutes) with big numbers.
    - Example structure: "For Time: 100 Air Squats, 80 Push-ups, 60 Sit-ups, 40 Burpees, 20 Pull-ups"
      `;
    case "strength_metcon":
      return `
    ### 2. Workout Format - Strength + Metcon
    - **MANDATORY**: Generate a workout with both strength and conditioning portions.
    - Structure: Two parts labeled "a)" for strength and "b)" for metcon.
    - Strength portion: Heavy/technical movements, lower reps (3-8 reps).
    - Metcon portion: Faster-paced conditioning work.
    - Example structure: "a) 5x3 Deadlifts (heavy), b) 8-Minute AMRAP: 10 Box Jumps, 15 Push-ups"
      `;
    default:
      return getRandomFormatInstructions();
  }
};

const getRandomFormatInstructions = (): string => {
  return `
    ### 2. Workout Formats (Choose One or a Mix)
    - **For Time**: Complete work as fast as possible.
    - **AMRAP (As Many Rounds/Reps As Possible)**: Max work in time limit.
    - **EMOM (Every Minute on the Minute)**: Perform fixed work each minute.
    - **Intervals**: Work/Rest cycling for intensity balance.
    - **Chipper**: Long workout with a descending workload.
    - **Strength + Metcon**: Strength portion + conditioning portion.
    - **Partner/Team Workouts** (if appropriate): Shared work with clear structure.

    *⚠️ Ensure a variety of workout formats across multiple generated workouts.*
  `;
};
