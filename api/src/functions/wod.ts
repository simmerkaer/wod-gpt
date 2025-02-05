import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { AzureOpenAI, AzureClientOptions } from "openai";
import { wodGenerationPrompts } from "../prompts/wodGeneration";

export async function wod(
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
    apiVersion: "2024-08-01-preview",
  };

  const openai = new AzureOpenAI(configuration);

  try {
    const body = await request.json();

    const prompt = wodGenerationPrompts(
      body["random"],
      body["exercises"],
      body["timeframe"],
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1200,
    });

    const answer = completion.choices[0]!.message?.content;

    return {
      status: 200,
      body: answer,
    };
  } catch (error: any) {
    context.log("Error calling the API:", error);
    return {
      status: 500,
      body: "Error calling the API",
    };
  }
}

app.http("wod", {
  route: "wod",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: wod,
});
