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
      - Shorter workouts (e.g., under 15 min) may have just one section.
      - Medium-length workouts (e.g., 15-25 min) may have 1-2 sections.
      - Longer workouts (e.g., 30+ min) may have 1 long section (e.g., EMOM30) or multiple shorter sections (e.g., 3 x 10 min).
    - Each part of the workout should be prefixed **only** with "a)", "b)", "c)", etc., when multiple parts exist.
    - Do **not** include any headers, titles, or extra text like "Workout" or explanations—just output the workout itself.

    **Workout Duration Guidelines:**
    If the workout includes the following movements, use these pacing estimates to ensure it fits the timeframe:

    **ERG Machines (Pacing Estimates)**
    - **BikeERG**: ~2:00 min per **1000m**  
      - Sprint efforts: ~1:30 min per 1000m  
      - Moderate efforts: ~2:00-2:30 min per 1000m  
    - **Rower**: ~2:00 min per **500m**  
      - Sprint efforts: ~1:40 min per 500m  
      - Moderate efforts: ~2:10-2:30 min per 500m  
    - **SkiERG**: ~2:00 min per **500m**  
      - Sprint efforts: ~1:50 min per 500m  
      - Moderate efforts: ~2:15-2:30 min per 500m  

    **Jump Rope**
    - **Double Unders**: ~1:00 min per **100 reps**  
      - Fast athletes: ~0:45 min per 100  
      - Beginners: ~1:15 min per 100  
    - **Single Unders**: ~1:00 min per **200 reps**  

    **Bodyweight Movements**
    - **Air Squats**: ~1:00 min per **40-50 reps**  
    - **Push-ups**: ~1:00 min per **30-40 reps**  
    - **Burpees**: ~1:00 min per **12-15 reps**  
    - **Box Jumps (24"/20")**: ~1:00 min per **15-18 reps**  
    - **Pull-ups**: ~1:00 min per **15-20 reps**  
      - Chest-to-bar: ~1:00 min per **12-15 reps**  
      - Strict: ~1:00 min per **8-12 reps**  

    **Barbell Movements (Moderate Weight)**
    - **Deadlifts**: ~1:00 min per **15-20 reps**  
    - **Squat Cleans**: ~1:00 min per **8-12 reps**  
    - **Power Cleans**: ~1:00 min per **10-15 reps**  
    - **Snatches**: ~1:00 min per **6-10 reps**  
    - **Thrusters**: ~1:00 min per **10-12 reps**  

    **Dumbbell/Kettlebell Movements**
    - **Dumbbell Snatches**: ~1:00 min per **15-20 reps**  
    - **Dumbbell Box Step-ups**: ~1:00 min per **12-15 reps**  
    - **Kettlebell Swings (American)**: ~1:00 min per **15-20 reps**  

    **Gymnastics Movements**
    - **Handstand Push-ups (Strict)**: ~1:00 min per **6-10 reps**  
    - **Handstand Push-ups (Kipping)**: ~1:00 min per **12-15 reps**  
    - **Muscle-ups (Bar/Rings)**: ~1:00 min per **5-8 reps**  

    **Running**
    - **200m Run**: ~0:45-1:00 min  
    - **400m Run**: ~1:30-2:00 min  
    - **800m Run**: ~3:30-4:30 min  
    - **1 Mile Run**: ~7:00-10:00 min  

    **Other Movements**
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
