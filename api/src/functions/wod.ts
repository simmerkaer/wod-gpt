import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

export async function wod(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const openAiUri = process.env.OPEN_AI_TARGET_URI;
  const openAiApiKey = process.env.OPEN_AI_TARGET_KEY;

  const payload = {
    prompt: "Hello my friend",
    max_tokens: 100,
  };

  try {
    const response = await fetch(openAiUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": openAiApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();

    return {
      status: response.status,
      body: data,
    };
  } catch (error: any) {
    context.error("Error calling GPT model endpoint:", error);
    return {
      status: error.status || 500,
      body: error.message || "An error occurred while processing your request.",
    };
  }
}

app.http("wod", {
  route: "wod",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: wod,
});
