import { createHash } from 'crypto';
import { HttpRequest } from '@azure/functions';

/**
 * Returns a stable hash of the caller's IP, used to key anonymous usage
 * tracking. We never persist the raw IP — only the hash. Shared IPs (offices,
 * gyms, CGNAT) share a bucket; that's an accepted trade-off for the free tier.
 */
export function getClientIpHash(request: HttpRequest): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  let ip = forwarded.split(',')[0].trim();

  // Azure includes the port: "1.2.3.4:5678" or "[2001:db8::1]:5678".
  const v4WithPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (v4WithPort) ip = v4WithPort[1];
  const v6WithPort = ip.match(/^\[(.+)\]:\d+$/);
  if (v6WithPort) ip = v6WithPort[1];

  if (!ip) ip = 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
