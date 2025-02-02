export const wodGenerationPrompts = (
  exercises: string[],
  timeframeInMinutes: number,
) => {
  return `
    You are a CrossFit programming generator. Your task is to design a CrossFit workout using only the following exercises:

    ${exercises.map((x) => `- ${x}`).join("\n")}

    Important Rules:
    - Use only the exercises listed above. Do not add any others.
    - Structure the workout to fit approximately within ${timeframeInMinutes} minutes.
    - The number of workout segments should vary based on the total duration:
      - Shorter workouts (e.g., under 15 min) may have just one section.
      - Medium-length workouts (e.g., 15-25 min) may have 1-2 sections.
      - Longer workouts (e.g., 30+ min) may have 1 long section (e.g., EMOM30) or multiple shorter sections (e.g., 3 x 10 min).
    - Each part of the workout should be prefixed with "a.", "b.", "c.", etc., but only if there are multiple parts.
    - Ensure appropriate rep schemes, intensity, and structure.

    Keep the workout concise and to the point, without additional instructions or explanations.

    Examples:

    ${wodExamples}

    These examples serve as inspiration. Generate a unique workout based on the provided exercises and timeframe.

    Now, create a complete workout based on these instructions.
  `;
};

export const wodExamples = `
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
`;
