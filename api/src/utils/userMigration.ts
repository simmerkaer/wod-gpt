import { BlobStorageService } from '../services/blobStorageService';

export interface RawPrincipal {
  identityProvider?: string;
  userId?: string;
  userDetails?: string;
  claims?: { typ: string; val: string }[];
}

const EMAIL_CLAIM_KEYS = [
  'email',
  'emailaddress',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
];

function getEmailClaim(principal: RawPrincipal): string | undefined {
  for (const claim of principal.claims || []) {
    if (EMAIL_CLAIM_KEYS.includes(claim.typ)) return claim.val;
  }
  return undefined;
}

/**
 * Resolve the blob-storage key for a request principal.
 *
 * - Legacy SWA-Google sign-ins keep their existing behaviour (userDetails || userId).
 * - Auth0 sign-ins canonicalise to the Auth0 `sub` (e.g. `google-oauth2|123`, `auth0|abc`).
 *   On first request for a returning Google user, the existing blob (keyed by the raw
 *   Google sub, email, or display name from the legacy regime) is renamed to the new key.
 */
export async function resolveBlobUserId(
  principal: RawPrincipal,
  blobService: BlobStorageService,
): Promise<string> {
  if (principal.identityProvider !== 'auth0') {
    const legacy = (principal.userDetails || principal.userId || '').trim();
    if (!legacy) throw new Error('Principal has no usable identifier');
    return legacy;
  }

  const newId = (principal.userId || '').trim();
  if (!newId) throw new Error('Auth0 principal has no userId');

  if (await blobService.userWorkoutBlobExists(newId)) {
    return newId;
  }

  const candidates: string[] = [];

  if (newId.startsWith('google-oauth2|')) {
    const rawGoogleSub = newId.split('|', 2)[1];
    if (rawGoogleSub) candidates.push(rawGoogleSub);
  }

  const email = getEmailClaim(principal);
  if (email) candidates.push(email);

  if (principal.userDetails) candidates.push(principal.userDetails);

  for (const candidate of candidates) {
    if (!candidate || candidate === newId) continue;
    if (await blobService.userWorkoutBlobExists(candidate)) {
      await blobService.migrateUserBlob(candidate, newId);
      return newId;
    }
  }

  return newId;
}
