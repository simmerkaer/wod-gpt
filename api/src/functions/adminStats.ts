import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { isAllowlistedAdmin } from '../utils/adminAuth';

export async function adminStats(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method !== 'GET') {
    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  }

  const principal = request.headers.get('x-ms-client-principal');
  if (!principal) {
    return { status: 401, jsonBody: { error: 'Unauthorized' } };
  }

  const allowlist = process.env.ADMIN_EMAILS;
  if (!isAllowlistedAdmin(principal, allowlist)) {
    context.log('adminStats: forbidden');
    return { status: 403, jsonBody: { error: 'Forbidden' } };
  }

  try {
    const blob = new BlobStorageService();
    const stats = await blob.getAdminDashboardStats();
    return {
      status: 200,
      jsonBody: {
        ...stats,
        note:
          'userCount = users with at least one saved workout; totalGenerations includes all generateWod calls.',
      },
    };
  } catch (e) {
    context.error('adminStats error', e);
    return {
      status: 500,
      jsonBody: {
        error: e instanceof Error ? e.message : 'Failed to load admin stats',
      },
    };
  }
}

// Route must not start with "admin" — Azure Functions reserves /admin/* for the host.
app.http('ownerDashboardStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: adminStats,
  route: 'owner/stats',
});
