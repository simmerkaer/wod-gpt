import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function wod(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);


    return { body: `Hello, wod!` };
};

app.http('wod', {
    route: 'wod',
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wod
});
