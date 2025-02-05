import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  output,
} from "@azure/functions";

interface CosmosFeedbackItem {
  id: string;
  date: string;
  email: string;
  feedback: string;
}
const sendToCosmosDb = output.cosmosDB({
  databaseName: "wod-gpt",
  containerName: "feedback",
  createIfNotExists: false,
  connection: "COSMOS_DB_CONNECTION_STRING",
});
export async function giveFeedback(
  request: HttpRequest,
  context: InvocationContext,
): Promise<any> {
  try {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json();

    const id =
      new Date().toISOString() + Math.random().toString().substring(2, 10);
    const date = new Date().toISOString();
    const email = body["email"];
    const feedback = body["feedback"];

    console.log("Feedback received:", feedback);

    const cosmosDoc: CosmosFeedbackItem = {
      id,
      date,
      email,
      feedback,
    };

    // Output to Database
    context.extraOutputs.set(sendToCosmosDb, cosmosDoc);

    return { body: "Feedback received" };
  } catch (error) {
    context.log(`Error: ${error}`);
    return { status: 500, body: "Internal Server Error" };
  }
}

app.http("giveFeedback", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: giveFeedback,
  extraOutputs: [sendToCosmosDb],
});
