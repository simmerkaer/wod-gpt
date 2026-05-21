import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function getConfig(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const authProvider = process.env.AUTH_PROVIDER === 'auth0' ? 'auth0' : 'google';
  return {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
    jsonBody: { authProvider },
  };
}

app.http('getConfig', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getConfig,
  route: 'config',
});
