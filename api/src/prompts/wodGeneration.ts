import { movementIds } from "../movements/movements";
import {
  FormatType,
  MovementId,
  WeightUnit,
  WorkoutFormat,
  WorkoutIntent,
} from "../movements/types";

// Structured prompt for JSON output
export const getStructuredPrompt = (
  random: boolean,
  providedMovementIds: MovementId[],
  formatType: FormatType,
  workoutFormat?: WorkoutFormat,
  weightUnit: WeightUnit = "kg",
  workoutLength?: string,
  customMinutes?: number,
  workoutIntent?: WorkoutIntent,
) => {
  const allowedMovements = random
    ? movementIds.map((x) => `- ${x}`).join("\n")
    : movementIds
        .filter((x) => providedMovementIds.includes(x))
        .map((x) => `- ${x}`)
        .join("\n");

  const formatInstructions =
    formatType === "specific" && workoutFormat
      ? getSpecificFormatInstructions(workoutFormat)
      : getRandomFormatInstructions();

  const unitInstructions =
    weightUnit === "lbs"
      ? "- ALWAYS use imperial units (lbs, ft, in, etc.)."
      : "- ALWAYS use metric units (kg, m, etc.).";

  // Generate length-specific instructions
  const lengthInstructions = getLengthInstructions(workoutLength, customMinutes);

  // Generate intent-specific instructions
  const intentInstructions = getIntentInstructions(workoutIntent);

  return `
You are a CrossFit programming generator. You must return your response as a JSON object with the following structure:

{
  "workout": {
    "text": "the complete workout description",
    "format": "amrap|emom|for_time|chipper" (when random) OR "amrap|emom|for_time|intervals|chipper|strength_metcon" (when specific),
    "difficulty": "beginner|intermediate|advanced"
  },
  "timing": {
    "type": "countdown|countup|interval|none",
    "duration": <number in minutes>,
    "intervals": {
      "work": <work period in minutes>,
      "rest": <rest period in minutes>,
      "rounds": <number of rounds>
    },
    "timeCapMinutes": <optional time cap in minutes>,
    "description": "human readable timing description"
  },
  "metadata": {
    "movements": ["list", "of", "movements", "used"],
    "estimatedCalories": <optional estimated calories>,
    "equipment": ["optional", "equipment", "list"],
    "scalingOptions": ["optional", "scaling", "suggestions"]
  }
}

CRITICAL TIMING RULES:
- AMRAP: type="countdown", duration=workout time (8-25 minutes), description="X-Minute AMRAP"
- EMOM: type="interval", intervals={work: 1, rest: 0, rounds: total_minutes}, description="X-Minute EMOM" 
- For Time: type="countup", duration=0, timeCapMinutes=reasonable_cap, description="For Time (X min cap)"
- Intervals: type="interval", intervals={work: work_mins, rest: rest_mins, rounds: num_rounds}, description="X Rounds (Y min work, Z min rest)"
- Chipper: type="countup", duration=0, timeCapMinutes=reasonable_cap, description="Chipper For Time"
- Strength+Metcon: type="countdown", duration=metcon_time, description="X-Minute MetCon"

CRITICAL EMOM FORMATTING:
- Use "1.", "2.", "3." etc. for each minute (NOT "Minute 1:", "Minute 2:")
- Example: "15-Minute EMOM:\n1. 12 Burpees\n2. 15 Box Jumps\n3. 10 Thrusters"

RANDOM vs SPECIFIC FORMAT RULES:
- When formatType is "random": ONLY use EMOM, AMRAP, For Time, or Chipper
- When formatType is "specific": Use the exact format requested (can include Intervals, Strength+Metcon)

${formatInstructions}

${lengthInstructions}

${intentInstructions}

Your task is to design an effective and well-balanced CrossFit workout using only the following exercises:

${allowedMovements}

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

### 2. Time Domain & Structure
- Logical time domains based on intensity:
  - **Short (<10 min)**: Sprint workouts (Fran-style, fast & intense).
  - **Medium (10-20 min)**: Classic metcons (Helen, Jackie).
  - **Long (20-40 min)**: Endurance-based (Murph, Cindy, Chippers).
- For longer workouts:
  - **15-25 min**: May include 1-2 sections.
  - **30+ min**: Should have multiple structured parts (e.g., EMOM + Metcon).
- Separate each section with **"a)", "b)", "c)", etc.**

### 3. Rep Ranges & Scaling Considerations
- Avoid too few reps per set (e.g., don't program 3 reps unless very heavy).
- Use rep schemes that maintain intensity.
- ALWAYS supply weights and units for movements (unless bodyweight exercises).
- EXCEPTION: For Box Jumps and Wall Balls, omit height/weight specifications for cleaner display (just use "Box Jumps" and "Wall Balls")
${unitInstructions}

MOVEMENT FORMATTING RULES:
- Box Jumps: Use "Box Jumps" (no height specification)
- Wall Balls: Use "Wall Balls" (no weight/height specification)  
- Other movements: Include weights/specifications as normal

🚨 CRITICAL: You MUST respond with valid JSON only. Do not include any explanations, markdown formatting, or extra text outside the JSON object.

Movements to use:
${allowedMovements}
`;
};

export const wodGenerationPrompts = (
  random: boolean,
  providedMovementIds: MovementId[],
  formatType: FormatType,
  workoutFormat?: WorkoutFormat,
  weightUnit: WeightUnit = "kg",
  workoutLength?: string,
  customMinutes?: number,
  workoutIntent?: WorkoutIntent,
) => {
  const allowedMovements = random
    ? movementIds.map((x) => `- ${x}`).join("\n")
    : movementIds
        .filter((x) => providedMovementIds.includes(x))
        .map((x) => `- ${x}`)
        .join("\n");

  // Generate format-specific instructions
  const formatInstructions =
    formatType === "specific" && workoutFormat
      ? getSpecificFormatInstructions(workoutFormat)
      : getRandomFormatInstructions();

  const unitInstructions =
    weightUnit === "lbs"
      ? "- ALWAYS use imperial units (lbs, ft, in, etc.)."
      : "- ALWAYS use metric units (kg, m, etc.).";

  // Generate length-specific instructions
  const lengthInstructions = getLengthInstructions(workoutLength, customMinutes);

  // Generate intent-specific instructions
  const intentInstructions = getIntentInstructions(workoutIntent);

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

    ${lengthInstructions}

    ${intentInstructions}

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
    - 15 Box Jumps

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
    - 12 Burpee Box Jump Overs

    ### Example 4 (Chipper) ###

    For Time:
    - 50 Wall Balls
    - 40 Box Jump Overs
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
    - EXCEPTION: For Box Jumps and Wall Balls, use simplified names without height/weight specifications.
    ${unitInstructions}
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
    - **CRITICAL FORMATTING**: Use "1.", "2.", "3." etc. (NOT "Minute 1:", "Minute 2:")
    - Example structure: "10-Minute EMOM: 1. 12 Burpees, 2. 15 Box Jumps" (then repeat)
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
    ### 2. Workout Formats (Choose One - Random Selection)
    - **EMOM (Every Minute on the Minute)**: Perform fixed work each minute. Use "1.", "2.", "3." formatting.
    - **AMRAP (As Many Rounds/Reps As Possible)**: Max work in time limit.
    - **For Time**: Complete work as fast as possible.
    - **Chipper**: Long workout with a descending workload.

    **MANDATORY**: Only use these 4 formats when formatType is "random". Do not use Intervals or Strength+Metcon.
    
    *⚠️ Ensure a variety of workout formats across multiple generated workouts.*
  `;
};

const getLengthInstructions = (workoutLength?: string, customMinutes?: number): string => {
  if (!workoutLength) {
    return "";
  }

  switch (workoutLength) {
    case "short":
      return `
    ### WORKOUT LENGTH REQUIREMENTS - SHORT (5-12 MINUTES)
    - **MANDATORY**: Create a workout that will take 5-12 minutes to complete
    - Focus on high intensity, sprint-style workouts
    - Use smaller rep counts and shorter distances
    - AMRAP: 5-8 minutes, EMOM: 5-10 minutes, For Time: 5-12 minute cap
    - Examples: "Fran" style (fast couplets), short bursts of intensity
      `;
    
    case "medium":
      return `
    ### WORKOUT LENGTH REQUIREMENTS - MEDIUM (15-25 MINUTES)
    - **MANDATORY**: Create a workout that will take 15-25 minutes to complete
    - Classic CrossFit time domain - balanced intensity and volume
    - AMRAP: 15-20 minutes, EMOM: 15-20 minutes, For Time: 15-25 minute cap
    - Examples: "Helen", "Jackie" style workouts
      `;
    
    case "long":
      return `
    ### WORKOUT LENGTH REQUIREMENTS - LONG (30-45 MINUTES)
    - **MANDATORY**: Create a workout that will take 30-45 minutes to complete
    - Focus on endurance and sustained effort
    - Higher rep counts, longer distances, multiple parts
    - AMRAP: 30-40 minutes, EMOM: 30-40 minutes, For Time: 30-45 minute cap
    - Examples: "Murph", "Cindy" style workouts, multi-part sessions
      `;
    
    case "custom":
      const minutes = customMinutes || 20;
      return `
    ### WORKOUT LENGTH REQUIREMENTS - CUSTOM (${minutes} MINUTES)
    - **MANDATORY**: Create a workout that will take approximately ${minutes} minutes to complete
    - Adjust rep counts, rounds, and intensity to fit this exact timeframe
    - For AMRAP: ${minutes} minutes, For EMOM: ${minutes} minutes, For Time: ${minutes} minute cap
    - Scale difficulty and volume appropriately for this specific duration
      `;
    
    default:
      return "";
  }
};

const getIntentInstructions = (workoutIntent?: WorkoutIntent): string => {
  if (!workoutIntent || workoutIntent === "general_fitness") {
    return `
    ### WORKOUT INTENT - GENERAL FITNESS
    - Create a balanced workout suitable for general conditioning
    - Mix of strength, cardio, and skill elements
    - Moderate intensity that builds overall fitness
    - Standard rep ranges and time domains
      `;
  }

  switch (workoutIntent) {
    case "strength":
      return `
    ### WORKOUT INTENT - STRENGTH BUILDING
    - **MANDATORY**: Emphasize heavy compound movements and strength development
    - Use lower rep ranges (1-8 reps) with higher weights
    - Include barbell movements: deadlifts, squats, presses, cleans
    - Longer rest periods between sets (2-3+ minutes for strength portions)
    - Focus on progressive overload and strength gains
    - If using Strength+Metcon format, make strength portion substantial
    - Rep ranges: 3-5 for heavy strength, 5-8 for strength endurance
      `;
    
    case "endurance":
      return `
    ### WORKOUT INTENT - ENDURANCE/CONDITIONING
    - **MANDATORY**: Focus on aerobic capacity and cardiovascular conditioning
    - Longer time domains (20+ minutes) with sustained effort
    - Emphasize cardio movements: running, rowing, biking, double unders
    - Higher rep ranges with moderate weights
    - Steady-state efforts or longer intervals with shorter rest
    - Build aerobic base and metabolic conditioning
    - Avoid overly heavy weights that limit movement continuity
      `;
    
    case "fat_loss":
      return `
    ### WORKOUT INTENT - FAT LOSS/HIIT
    - **MANDATORY**: Maximize caloric expenditure and metabolic stress
    - High intensity intervals with minimal rest periods
    - Compound movements that engage multiple muscle groups
    - Fast-paced circuits and AMRAP formats preferred
    - Rep ranges that maintain high heart rate (8-20+ reps)
    - Include explosive movements: burpees, thrusters, kettlebell swings
    - Short, intense time domains with maximum effort output
      `;
    
    case "skill_development":
      return `
    ### WORKOUT INTENT - SKILL DEVELOPMENT
    - **MANDATORY**: Focus on technical movements and skill progression
    - Include gymnastics movements: handstand pushups, muscle ups, rope climbs
    - Lower volume to allow focus on form and technique
    - Practice-friendly rep ranges (3-10 reps for technical movements)
    - Allow adequate rest for skill work quality
    - Mix skill practice with conditioning that supports skill development
    - Emphasize movement quality over intensity
      `;
    
    case "recovery":
      return `
    ### WORKOUT INTENT - RECOVERY/ACTIVE REST
    - **MANDATORY**: Create a low-intensity, restorative workout
    - Use lighter weights and higher rep ranges (15-30+ reps)
    - Include mobility-friendly movements and longer, slower efforts
    - Avoid high-impact or explosive movements
    - Focus on movement quality and blood flow
    - Longer time domains with conversational pace
    - Emphasize bodyweight movements and light resistance
      `;
    
    case "competition_prep":
      return `
    ### WORKOUT INTENT - COMPETITION PREPARATION
    - **MANDATORY**: Design sport-specific, high-intensity training
    - Include advanced movements and competition-style formats
    - High intensity with competition-level demands
    - Mix of time domains to prepare for various challenges
    - Include complex movements: snatches, muscle ups, handstand walks
    - Simulate competition stress with challenging rep schemes
    - Focus on mental toughness and performance under pressure
      `;
    
    default:
      return "";
  }
};
