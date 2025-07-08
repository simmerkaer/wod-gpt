import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { AzureClientOptions, AzureOpenAI } from "openai";
import { wodGenerationPrompts, getStructuredPrompt } from "../prompts/wodGeneration";
import { WorkoutFormat, MovementId, FormatType, WeightUnit } from "../movements/types";

export async function generateWod(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const openAiUri = process.env.OPEN_AI_TARGET_URI;
  const openAiApiKey = process.env.OPEN_AI_TARGET_KEY;

  if (!openAiUri || !openAiApiKey) {
    context.log(
      "Missing OPEN_AI_TARGET_URI or OPEN_AI_TARGET_KEY environment variables.",
    );
    return { status: 500, body: "Configuration error" };
  }

  const configuration: AzureClientOptions = {
    apiKey: openAiApiKey,
    endpoint: openAiUri,
    apiVersion: "2025-01-01-preview",
    deployment: "gpt-4.1",
  };

  const client = new AzureOpenAI(configuration);

  try {
    const body = await request.json();
    const workoutFormat: WorkoutFormat = body["workoutFormat"] || "amrap";
    
    // Attempt structured workout generation with multiple fallback layers
    const workoutResult = await generateStructuredWorkout(
      client,
      context,
      body["random"],
      body["exercises"],
      body["formatType"],
      workoutFormat,
      body["weightUnit"] || "kg",
      body["workoutLength"],
      body["customMinutes"]
    );

    return {
      status: 200,
      jsonBody: workoutResult,
    };
  } catch (error: any) {
    context.log("Error calling the API:", error);
    
    // Final fallback: return default workout
    const requestBody = await request.json().catch(() => ({}));
    const workoutFormat: WorkoutFormat = requestBody["workoutFormat"] || "amrap";
    const defaultWorkout = createDefaultWorkoutResponse(
      workoutFormat,
      "Error generating workout - please try again"
    );
    
    return {
      status: 200,
      jsonBody: defaultWorkout,
    };
  }
}

// Multi-layer fallback system for robust workout generation
async function generateStructuredWorkout(
  client: AzureOpenAI,
  context: InvocationContext,
  random: boolean,
  exercises: string[],
  formatType: string,
  workoutFormat: WorkoutFormat,
  weightUnit: string,
  workoutLength?: string,
  customMinutes?: number
) {
  // Layer 1: Try OpenAI structured outputs (Primary)
  try {
    context.log("Attempting structured AI generation...");
    
    const structuredPrompt = getStructuredPrompt(
      random,
      exercises as MovementId[],
      formatType as FormatType,
      workoutFormat,
      weightUnit as WeightUnit,
      workoutLength,
      customMinutes
    );

    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      max_completion_tokens: 10000,
      messages: [{
        role: "user",
        content: structuredPrompt,
      }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        
        // Add system metadata
        const workoutResponse = {
          ...parsed,
          system: {
            generated: new Date().toISOString(),
            version: "1.0.0",
            source: "ai",
            confidence: 0.95
          }
        };
        
        if (validateWorkoutResponse(workoutResponse)) {
          context.log("✅ Structured AI generation successful");
          return workoutResponse;
        } else {
          context.log("⚠️ AI response validation failed");
          // Could add repair logic here if needed
        }
      } catch (parseError) {
        context.log("❌ JSON parsing failed:", parseError);
      }
    }
  } catch (error) {
    context.log("❌ Structured AI generation failed:", error);
  }

  // Layer 2: Fallback to text generation + enhanced parsing (Secondary)
  try {
    context.log("Attempting text generation fallback...");
    
    const textPrompt = wodGenerationPrompts(
      random,
      exercises as MovementId[],
      formatType as FormatType,
      workoutFormat,
      weightUnit as WeightUnit,
      workoutLength,
      customMinutes
    );

    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      max_completion_tokens: 10000,
      messages: [{
        role: "user",
        content: textPrompt,
      }],
    });

    const workoutText = response.choices[0]?.message?.content;
    if (workoutText) {
      // Parse workout text to create structured response
      const parsed = parseWorkoutText(workoutText, workoutFormat);
      if (parsed) {
        context.log("✅ Text generation + parsing successful");
        return parsed;
      }
    }
  } catch (error) {
    context.log("❌ Text generation fallback failed:", error);
  }

  // Layer 3: Use format-based defaults (Tertiary)
  context.log("Using default workout fallback");
  return createDefaultWorkoutResponse(workoutFormat);
}

// Enhanced parsing utility for text-based workout responses
function parseWorkoutText(text: string, format: WorkoutFormat) {
  // This would implement enhanced regex parsing as fallback
  // For now, return null to trigger default response
  return null;
}

app.http("generateWod", {
  route: "generateWod",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: generateWod,
});

// Import validation utilities (these would need to be ported to the backend)
function validateWorkoutResponse(data: any): boolean {
  // Simplified validation for backend
  return (
    data &&
    data.workout &&
    data.timing &&
    data.metadata &&
    typeof data.workout.text === 'string' &&
    typeof data.timing.type === 'string' &&
    Array.isArray(data.metadata.movements)
  );
}

function createDefaultWorkoutResponse(format: WorkoutFormat, text?: string) {
  const defaultTimings = {
    amrap: { type: 'countdown', duration: 20, description: '20-Minute AMRAP' },
    emom: { type: 'interval', duration: 15, intervals: { work: 1, rest: 0, rounds: 15 }, description: '15-Minute EMOM' },
    for_time: { type: 'countup', duration: 0, timeCapMinutes: 15, description: 'For Time (15 min cap)' },
    intervals: { type: 'interval', duration: 20, intervals: { work: 3, rest: 1, rounds: 5 }, description: '5 Rounds (3 min work, 1 min rest)' },
    chipper: { type: 'countup', duration: 0, timeCapMinutes: 25, description: 'Chipper For Time (25 min cap)' },
    strength_metcon: { type: 'countdown', duration: 15, description: '15-Minute MetCon' }
  };

  return {
    workout: {
      text: text || 'Default workout - please regenerate',
      format,
      difficulty: 'intermediate'
    },
    timing: defaultTimings[format] || defaultTimings.amrap,
    metadata: {
      movements: ['unknown'],
      equipment: ['basic']
    },
    system: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      source: 'default',
      confidence: 0.5
    }
  };
}
