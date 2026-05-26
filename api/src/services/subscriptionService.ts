import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { BLOB_CONTAINER_NAME } from '../types/workoutHistory';

export interface UserSubscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  priceId?: string;
  /** ISO timestamp when the current paid period ends. */
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
  /** ISO timestamp of the Stripe event that last updated this record.
   *  Used to discard out-of-order webhook deliveries. */
  lastEventAt?: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused'
  | 'none';

const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export function isSubscriptionActive(sub: UserSubscription | null): boolean {
  if (!sub) return false;
  if (!ACTIVE_STATUSES.includes(sub.status)) return false;
  if (sub.currentPeriodEnd) {
    const end = new Date(sub.currentPeriodEnd).getTime();
    if (!Number.isNaN(end) && end < Date.now()) return false;
  }
  return true;
}

export interface DailyUsage {
  date: string;
  count: number;
  updatedAt: string;
}

function subscriptionBlobPath(userId: string): string {
  return `users/${userId}/subscription.json`;
}

function usageBlobPath(userId: string): string {
  return `users/${userId}/usage.json`;
}

function customerIndexBlobPath(stripeCustomerId: string): string {
  return `billing/stripe-customers/${stripeCustomerId}.json`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function streamToString(readable: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readable.on('data', (d) => chunks.push(d instanceof Buffer ? d : Buffer.from(d)));
    readable.on('end', () => resolve(Buffer.concat(chunks).toString()));
    readable.on('error', reject);
  });
}

export class SubscriptionService {
  private container: ContainerClient;

  constructor() {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) throw new Error('Azure Storage connection string is not configured');
    const blobClient = BlobServiceClient.fromConnectionString(conn);
    this.container = blobClient.getContainerClient(BLOB_CONTAINER_NAME);
  }

  private async ensure(): Promise<void> {
    await this.container.createIfNotExists();
  }

  private blob(path: string): BlockBlobClient {
    return this.container.getBlockBlobClient(path);
  }

  private async readJson<T>(path: string): Promise<T | null> {
    try {
      const client = this.blob(path);
      const dl = await client.download();
      const text = await streamToString(dl.readableStreamBody!);
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  private async writeJson(path: string, data: unknown): Promise<void> {
    const client = this.blob(path);
    const body = JSON.stringify(data, null, 2);
    await client.upload(body, Buffer.byteLength(body), {
      blobHTTPHeaders: { blobContentType: 'application/json' },
    });
  }

  async getSubscription(userId: string): Promise<UserSubscription | null> {
    await this.ensure();
    return this.readJson<UserSubscription>(subscriptionBlobPath(userId));
  }

  async saveSubscription(sub: UserSubscription): Promise<void> {
    await this.ensure();
    sub.updatedAt = new Date().toISOString();
    await this.writeJson(subscriptionBlobPath(sub.userId), sub);
    if (sub.stripeCustomerId) {
      await this.setCustomerIndex(sub.stripeCustomerId, sub.userId);
    }
  }

  /**
   * Save subscription only if the incoming event is at least as new as what
   * we already have. Returns true if written, false if the update was
   * discarded as stale. `eventCreatedAtIso` is the Stripe event's `created`
   * timestamp (ISO string).
   */
  async saveSubscriptionIfNewer(
    next: UserSubscription,
    eventCreatedAtIso: string | undefined,
  ): Promise<boolean> {
    const existing = await this.getSubscription(next.userId);
    if (
      existing?.lastEventAt &&
      eventCreatedAtIso &&
      new Date(eventCreatedAtIso).getTime() <
        new Date(existing.lastEventAt).getTime()
    ) {
      return false;
    }
    next.lastEventAt = eventCreatedAtIso ?? next.lastEventAt;
    await this.saveSubscription(next);
    return true;
  }

  async getUserIdByCustomerId(stripeCustomerId: string): Promise<string | null> {
    await this.ensure();
    const entry = await this.readJson<{ userId: string }>(customerIndexBlobPath(stripeCustomerId));
    return entry?.userId || null;
  }

  async setCustomerIndex(stripeCustomerId: string, userId: string): Promise<void> {
    await this.ensure();
    await this.writeJson(customerIndexBlobPath(stripeCustomerId), {
      userId,
      stripeCustomerId,
      updatedAt: new Date().toISOString(),
    });
  }

  async getDailyUsage(userId: string): Promise<DailyUsage> {
    await this.ensure();
    const today = todayKey();
    const data = await this.readJson<DailyUsage>(usageBlobPath(userId));
    if (!data || data.date !== today) {
      return { date: today, count: 0, updatedAt: new Date().toISOString() };
    }
    return data;
  }

  async incrementDailyUsage(userId: string): Promise<DailyUsage> {
    await this.ensure();
    const today = todayKey();
    const current = await this.readJson<DailyUsage>(usageBlobPath(userId));
    const base: DailyUsage =
      current && current.date === today
        ? current
        : { date: today, count: 0, updatedAt: new Date().toISOString() };
    const next: DailyUsage = {
      date: today,
      count: base.count + 1,
      updatedAt: new Date().toISOString(),
    };
    await this.writeJson(usageBlobPath(userId), next);
    return next;
  }
}
