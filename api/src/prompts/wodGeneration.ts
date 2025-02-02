export const wodGenerationPrompts = (
  exercises: string[],
  timeframeInMinutes: number,
) => {
  return `
    You are a CrossFit programming generator. Your task is to design a CrossFit workout using only the following exercises:

    ${exercises.map((x) => `- ${x}`).join("\n")}

    **Important Rules:**
    - Use only the exercises listed above. Do not add any others.
    - Structure the workout to fit approximately within ${timeframeInMinutes} minutes.
    - The number of workout segments should vary based on the total duration:
      - **Under 15 min:** Likely a single part.
      - **15-25 min:** May have 1-2 parts.
      - **30+ min:** Could be a single long part (e.g., EMOM30) or multiple shorter parts (e.g., 3 x 10 min).
    - If the workout has multiple parts, **ensure the total time roughly matches the provided timeframe.**  
      - Example: A **30-minute** workout might be **one 30-minute section, two 15-minute sections, or three 10-minute sections**.
    - Each part of the workout should be prefixed **only** with "a)", "b)", "c)", etc., when multiple parts exist.
    - Do **not** include any headers, titles, or extra text like "Workout" or explanations—just output the workout itself.

    **Minimum Work Requirements:**
    - Avoid excessively small rep counts. Movements should be programmed with a meaningful workload.  
    - **Minimum Calories**: No fewer than **10 calories** on any ERG machine.  
    - **Minimum Reps for Common Movements**:  
      - **Double Unders**: At least **30 reps** per set.  
      - **Single Unders**: At least **50 reps** per set.  
      - **Row/Bike/Ski Calories**: At least **10 calories per effort**.  
      - **Burpees, Box Jumps, Pull-ups, etc.**: At least **5 reps per set** unless extremely heavy/technical.  

    **Workout Formats:**
    - **For Time** – Complete a fixed amount of work as quickly as possible.
    - **AMRAP (As Many Rounds/Reps As Possible)** – Maximize work within a time limit.
    - **EMOM (Every Minute on the Minute)** – Perform a set amount of work each minute.
    - **Intervals** – Example: Work for 5 minutes, rest, then repeat.

    **Pacing & Duration Guidelines:**  
    Use these estimates to keep workouts within the intended timeframe. **Consider slight fatigue adjustments in longer workouts.**

    **🏋️‍♂️ Barbell Movements (Moderate Weight)**
    - **Deadlifts**: ~1:00 min per **15-20 reps**  
    - **Squat Cleans**: ~1:00 min per **8-12 reps**  
    - **Power Cleans**: ~1:00 min per **10-15 reps**  
    - **Snatches**: ~1:00 min per **6-10 reps**  
    - **Thrusters**: ~1:00 min per **10-12 reps**  

    **🏃‍♂️ Running**
    - **200m**: ~0:45-1:00 min  
    - **400m**: ~1:30-2:00 min  
    - **800m**: ~3:30-4:30 min  
    - **1 Mile**: ~7:00-10:00 min  

    **🚣‍♂️ ERG Machines (Pacing Estimates)**
    - **BikeERG**: ~2:00 min per **1000m**  
    - **Rower**: ~2:00 min per **500m**  
    - **SkiERG**: ~2:00 min per **500m**  

    **🔥 Gymnastics Movements**
    - **Handstand Push-ups (Strict)**: ~1:00 min per **6-10 reps**  
    - **Handstand Push-ups (Kipping)**: ~1:00 min per **12-15 reps**  
    - **Muscle-ups (Bar/Rings)**: ~1:00 min per **5-8 reps**  

    **🏋️‍♀️ Other Movements**
    - **Wall Balls (9/6 kg to 10'/9')**: ~1:00 min per **15-20 reps**  
    - **Rowing for Calories**: ~1:00 min per **12-15 calories**  
    - **BikeERG for Calories**: ~1:00 min per **15-20 calories**  
    - **SkiERG for Calories**: ~1:00 min per **12-15 calories**  

    **Examples:**  
    ${wodExamples}

    These examples serve as inspiration. Generate a unique workout based on the provided exercises and timeframe.

    Now, create a complete workout based on these instructions.
  `;
};

export const wodExamples = `

### Example 1

a)
15-12-9-6-3 reps for time of:
Deadlifts
Burpee pull-ups

♀ 80 kg
♂ 120 kg

b)
For time:
200-foot dumbbell overhead lunge
50 dumbbell box step-ups
50 strict handstand push-ups
200-foot handstand walk

♀ 15 kg dumbbell and a 50 cm box
♂ 22,5 kg dumbbell and a 60 cm box

c)
3 rounds for time of:
15 chest-to-bar pull-ups
30-calorie row
45 air squats

### Example 2

8 rounds for time of:
400-meter run
15 burpee box jump-overs
10-calorie bike
6 alternating dumbbell snatches

♀ 20-inch box and 50-lb dumbbell
♂ 24-inch box and 75-lb dumbbell

### Example 3

5 rounds for time of:
12 push jerks
12 back squats

♀ 95 lb
♂ 135 lb

### Example 4

15 box jumps
12 kettlebell swings
9 ring dips

♀ 20-inch box and 53-lb kettlebell
♂ 24-inch box and 70-lb kettlebell

### Example 5

For max reps:
Tabata dumbbell box step-ups
Rest 1 minute
Tabata GHD sit-ups
Rest 1 minute
Tabata push presses
Rest 1 minute
Tabata bar-facing burpees

The Tabata interval is 20 seconds of work followed by 10 seconds of rest for 8 intervals.

♀ 20-lb dumbbells, 20-inch box, and 65-lb barbell
♂ 35-lb dumbbells, 24-inch box, and 95-lb barbell
`;
