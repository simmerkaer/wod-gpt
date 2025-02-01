export const wodGenerationPrompts = (
  exercises: string[],
  timeframeInMinutes: number,
) => {
  return `
    You are a CrossFit programming generator. Your task is to design a CrossFit workout using only the following exercises:

    ${exercises.map((x) => `- ${x}`).join("\n")}

    Note: Do not include any exercises outside of the list above.

    The workout should be structured to fit within a rough timeframe of ${timeframeInMinutes} minutes. 
    
    Your generated workout should include appropriate exercise sequencesand rep schemes.
    Ensure that each part of the workout adheres strictly to the provided exercise list.

    Do not add any instructions or explanations to the workout. Keep it simple and to the point. 

    If the workout includes miltiple parts then each part is preficed with "a." "b." "c." etc.

    Examples:

    ${wodExamples}

    Please generate a complete workout plan based on these instructions.`;
};

export const wodExamples = `
######

15-12-9-6-3 reps for time of:
Deadlifts
Burpee pull-ups

Set the pull-up bar 6 inches above your reach.

♀ 185 lb
♂ 275 lb

######

For time:
200-foot dumbbell overhead lunge
50 dumbbell box step-ups
50 strict handstand push-ups
200-foot handstand walk

♀ 35-lb dumbbell and a 20-inch box
♂ 50-lb dumbbell and a 24-inch box

######

3 rounds for time of:
15 chest-to-bar pull-ups
30-calorie row
45 air squats

######

`;
