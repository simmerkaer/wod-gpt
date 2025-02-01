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
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an AI assistant that helps people find information.",
          },
        ],
      },
    ],
    max_tokens: 800,
  };

  const headers = {
    "Content-Type": "application/json",
    "api-key": openAiApiKey,
  };

  try {
    const response = await fetch(openAiUri, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    context.log(answer);
    return {
      status: 200,
      body: answer,
    };
  } catch (error) {
    context.error("Error calling the API:", error);
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
