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
  // SWA does not forward the full claims array to the API in the
  // x-ms-client-principal header, so fall back to userDetails, which the
  // auth0 provider populates with the email (via nameClaimType config).
  const claimEmail = pickClaim(principal, EMAIL_CLAIM_KEYS);
  const email =
    claimEmail ??
    (principal.userDetails?.includes('@') ? principal.userDetails : undefined);
  return {
    userId,
    email,
    displayName: pickClaim(principal, NAME_CLAIM_KEYS) || principal.userDetails,
    principal,
  };
}
