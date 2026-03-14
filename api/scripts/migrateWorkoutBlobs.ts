/**
 * One-time migration: merge legacy monthly blobs users/{id}/YYYY/MM/workouts.json
 * into a single users/{id}/workouts.json per user.
 *
 * Usage:
 *   set AZURE_STORAGE_CONNECTION_STRING=...
 *   npm run migrate-workouts -- --dry-run
 *   npm run migrate-workouts
 *   npm run migrate-workouts -- --delete-legacy
 *
 * Run --dry-run first. Then run without flags to upload merged blobs.
 * Run with --delete-legacy only after verifying merged data (removes old monthly blobs).
 */

import { BlobServiceClient } from '@azure/storage-blob';
import {
  BLOB_CONTAINER_NAME,
  getUserWorkoutBlobPath,
  LEGACY_MONTHLY_BLOB_REGEX,
  SavedWorkout,
  UserWorkoutCollection,
} from '../src/types/workoutHistory';

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run');
  const deleteLegacy = process.argv.includes('--delete-legacy');
  return { dryRun, deleteLegacy };
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString()));
    stream.on('error', reject);
  });
}

function dedupeById(workouts: SavedWorkout[]): SavedWorkout[] {
  const byId = new Map<string, SavedWorkout>();
  for (const w of workouts) {
    if (!w?.id) continue;
    const existing = byId.get(w.id);
    if (!existing) {
      byId.set(w.id, w);
      continue;
    }
    const tNew = new Date(w.savedAt || 0).getTime();
    const tOld = new Date(existing.savedAt || 0).getTime();
    if (tNew >= tOld) {
      byId.set(w.id, w);
    }
  }
  return Array.from(byId.values());
}

async function main() {
  const { dryRun, deleteLegacy } = parseArgs();
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('AZURE_STORAGE_CONNECTION_STRING is required');
    process.exit(1);
  }

  const client = BlobServiceClient.fromConnectionString(connectionString);
  const container = client.getContainerClient(BLOB_CONTAINER_NAME);

  const legacyByUser = new Map<string, string[]>();
  const newBlobPaths = new Set<string>();

  for await (const item of container.listBlobsFlat({ prefix: 'users/' })) {
    const name = item.name;
    const legacyMatch = name.match(LEGACY_MONTHLY_BLOB_REGEX);
    if (legacyMatch) {
      const userId = legacyMatch[1];
      if (!legacyByUser.has(userId)) {
        legacyByUser.set(userId, []);
      }
      legacyByUser.get(userId)!.push(name);
      continue;
    }
    if (name.match(/^users\/[^/]+\/workouts\.json$/)) {
      newBlobPaths.add(name);
    }
  }

  const userIds = new Set<string>([...legacyByUser.keys()]);
  for (const p of newBlobPaths) {
    const m = p.match(/^users\/([^/]+)\/workouts\.json$/);
    if (m) userIds.add(m[1]);
  }

  console.log(
    `Found ${legacyByUser.size} users with legacy monthly blobs; ${newBlobPaths.size} existing single-blob paths; ${userIds.size} distinct user ids to process.`,
  );

  if (dryRun) {
    for (const [userId, paths] of legacyByUser) {
      console.log(`[dry-run] ${userId}: ${paths.length} legacy blob(s) -> ${getUserWorkoutBlobPath(userId)}`);
    }
    console.log('[dry-run] No uploads or deletes. Remove --dry-run to merge and upload.');
    return;
  }

  let uploaded = 0;
  let deleted = 0;

  for (const userId of userIds) {
    const legacyPaths = legacyByUser.get(userId) ?? [];
    const singlePath = getUserWorkoutBlobPath(userId);
    const singleClient = container.getBlockBlobClient(singlePath);

    const allWorkouts: SavedWorkout[] = [];

    for (const path of legacyPaths.sort()) {
      try {
        const res = await container.getBlockBlobClient(path).download();
        const text = await streamToString(res.readableStreamBody!);
        const coll = JSON.parse(text) as UserWorkoutCollection;
        if (Array.isArray(coll.workouts)) {
          allWorkouts.push(...coll.workouts);
        }
      } catch (e) {
        console.warn(`Skip legacy ${path}:`, (e as Error).message);
      }
    }

    const hasOnlyNewFormat = legacyPaths.length === 0 && newBlobPaths.has(singlePath);
    if (hasOnlyNewFormat) {
      continue;
    }

    try {
      const res = await singleClient.download();
      const text = await streamToString(res.readableStreamBody!);
      const coll = JSON.parse(text) as UserWorkoutCollection;
      if (Array.isArray(coll.workouts)) {
        allWorkouts.push(...coll.workouts);
      }
    } catch {
      /* no existing single blob */
    }

    if (allWorkouts.length === 0 && legacyPaths.length === 0) {
      continue;
    }

    const merged = dedupeById(allWorkouts);
    merged.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );

    const collection: UserWorkoutCollection = {
      workouts: merged,
      lastUpdated: new Date().toISOString(),
    };

    const body = JSON.stringify(collection, null, 2);
    await singleClient.upload(body, body.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' },
      metadata: {
        userId,
        lastUpdated: collection.lastUpdated,
        workoutCount: String(merged.length),
      },
    });
    uploaded++;
    console.log(`Uploaded ${singlePath} (${merged.length} workouts)`);

    if (deleteLegacy && legacyPaths.length) {
      for (const path of legacyPaths) {
        await container.getBlockBlobClient(path).deleteIfExists();
        deleted++;
      }
      console.log(`Deleted ${legacyPaths.length} legacy blob(s) for ${userId}`);
    }
  }

  console.log(`Done. Uploaded/updated ${uploaded} user blob(s). Deleted ${deleted} legacy blob(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
