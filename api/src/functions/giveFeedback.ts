import { app, HttpRequest, InvocationContext } from "@azure/functions";

import { EmailClient } from "@azure/communication-email";

interface CosmosFeedbackItem {
  id: string;
  date: string;
  email: string;
  feedback: string;
}

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

    const emailClient = new EmailClient(process.env.EMAIL_CONNECTION_STRING);
    const emailMessage = {
      senderAddress:
        "DoNotReply@cfb782b4-b261-44b6-84df-c552ce46488d.azurecomm.net",
      content: {
        subject: "wod-gpt: Feedback Received",
        html: `
    <html>
      <body>
        <h1>Feedback from wod-gpt</h1>

        <b>Date:</b> ${date}<br>
        <b>Email:</b> ${email}<br>
        <br>
        <b>Feedback:</b> <br>
        ${feedback}
      </body>
    </html>`,
      },
      recipients: {
        to: [{ address: "simmerkaer@gmail.com" }],
      },
    };

    const poller = await emailClient.beginSend(emailMessage);
    await poller.pollUntilDone();

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
});
