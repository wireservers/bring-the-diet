import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, type AppendBlobClient } from "@azure/storage-blob";

/**
 * Secondary, append-only audit sink in Azure Blob Storage.
 *
 * The Mongo AuditLog collection is the primary source — fast to query and
 * already wired into the app. The blob sink is the *immutable evidence vault*
 * for SOC 2 / SOX-class controls: a compromised app or admin Mongo session
 * cannot rewrite history that has already been appended to a blob in a
 * container with a time-based immutability policy.
 *
 * Wire-up:
 *   AUDIT_BLOB_ACCOUNT="bringthebudgetaudit"     (storage account name)
 *   AUDIT_BLOB_CONTAINER="audit-prod"            (container with WORM policy)
 *
 * If either env var is missing, this module is a no-op (the Mongo write is
 * still happening, just no blob shipment). That keeps local dev unaffected.
 *
 * Auth: DefaultAzureCredential — works with the Web App's Managed Identity
 * in Azure, and with `az login` locally.
 */

let clientPromise: Promise<AppendBlobClient | null> | null = null;
let currentDay = "";

const account = process.env.AUDIT_BLOB_ACCOUNT;
const container = process.env.AUDIT_BLOB_CONTAINER;
// Top-level folder under the (shared) container — one per app on the same
// subscription. e.g. "bring-the-budget" → audit/bring-the-budget/...
const appPrefix = (process.env.AUDIT_BLOB_APP_PREFIX || "bring-the-budget").replace(/\/+$/, "");

function today(): string {
  // YYYY-MM-DD in UTC so all instances roll over together.
  return new Date().toISOString().slice(0, 10);
}

async function getBlob(): Promise<AppendBlobClient | null> {
  if (!account || !container) return null;
  const day = today();
  if (clientPromise && currentDay === day) return clientPromise;

  currentDay = day;
  clientPromise = (async () => {
    try {
      const cred = new DefaultAzureCredential();
      const service = new BlobServiceClient(`https://${account}.blob.core.windows.net`, cred);
      const containerClient = service.getContainerClient(container);
      const blob = containerClient.getAppendBlobClient(`audit/${appPrefix}/${day}.jsonl`);
      await blob.createIfNotExists();
      return blob;
    } catch (err) {
      console.error("[audit-sink] init failed", err);
      return null;
    }
  })();
  return clientPromise;
}

export function isImmutableSinkEnabled(): boolean {
  return Boolean(account && container);
}

/**
 * Count audit events shipped to the immutable sink for a given UTC day,
 * optionally filtered to one user. Returns null if the day's blob doesn't
 * exist yet (legitimate — no events that day).
 */
export async function countSinkEvents(
  day: string,
  userId?: string,
): Promise<number | null> {
  if (!isImmutableSinkEnabled() || !account || !container) return null;
  try {
    const cred = new DefaultAzureCredential();
    const service = new BlobServiceClient(`https://${account}.blob.core.windows.net`, cred);
    const containerClient = service.getContainerClient(container);
    const blob = containerClient.getBlobClient(`audit/${appPrefix}/${day}.jsonl`);
    if (!(await blob.exists())) return null;
    const buf = await blob.downloadToBuffer();
    let count = 0;
    for (const line of buf.toString("utf8").split("\n")) {
      if (!line) continue;
      if (!userId) {
        count++;
        continue;
      }
      try {
        const obj = JSON.parse(line) as { userId?: string };
        if (obj.userId === userId) count++;
      } catch {
        // Malformed line — skip silently.
      }
    }
    return count;
  } catch (err) {
    console.error("[audit-sink] countSinkEvents failed", { day, err });
    return null;
  }
}

/**
 * Fire-and-forget shipment of one audit row to the immutable blob. Failures
 * are logged but never re-thrown — primary truth is still Mongo.
 */
export function shipAuditEvent(doc: Record<string, unknown>): void {
  if (!isImmutableSinkEnabled()) return;
  // Stamp server-side time so the blob record is independent of the caller.
  const line = JSON.stringify({ ...doc, _sinkAt: new Date().toISOString() }) + "\n";
  getBlob()
    .then((blob) => {
      if (!blob) return;
      return blob.appendBlock(line, Buffer.byteLength(line));
    })
    .catch((err) => {
      console.error("[audit-sink] append failed", { resource: doc.resource, action: doc.action, err });
    });
}
