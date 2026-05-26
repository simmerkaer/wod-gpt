import { HttpRequest } from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { resolveBlobUserId, RawPrincipal } from './userMigration';

export interface AuthedUser {
  userId: string;
  email?: string;
  displayName?: string;
  principal: RawPrincipal;
}

const EMAIL_CLAIM_KEYS = [
  'email',
  'emailaddress',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
];

const NAME_CLAIM_KEYS = [
  'name',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
];

function pickClaim(principal: RawPrincipal, keys: string[]): string | undefined {
  for (const c of principal.claims || []) {
    if (keys.includes(c.typ) && c.val) return c.val;
  }
  return undefined;
}

/** Returns authed user info from the SWA client-principal header, or null if anonymous. */
export async function getAuthedUser(
  request: HttpRequest,
  blobService: BlobStorageService,
): Promise<AuthedUser | null> {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;
  let principal: RawPrincipal;
  try {
    principal = JSON.parse(Buffer.from(header, 'base64').toString());
  } catch {
    return null;
  }
  if (!principal.userId) return null;
  const userId = await resolveBlobUserId(principal, blobService);
  return {
    userId,
    email: pickClaim(principal, EMAIL_CLAIM_KEYS),
    displayName: pickClaim(principal, NAME_CLAIM_KEYS) || principal.userDetails,
    principal,
  };
}
