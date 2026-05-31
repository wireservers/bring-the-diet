// Application-layer AES-256-GCM for sensitive Mongo string fields.
//
// Cosmos disk encryption protects against a stolen backup. This protects
// against an attacker who has only a Mongo credential — they see ciphertext
// in the documents, not PII (creditor names, collector names, notes,
// contact values, address lines).
//
// Wire format: "v1:" + base64url(IV(12) || TAG(16) || CT(n))
//
// Key source: FIELD_ENCRYPTION_KEY env (base64, 32 bytes). Falls back to a
// SHA-256 of AUTH_SECRET in dev so local boots work without extra config.
// Rotation: see docs/SECURITY.md — orphans existing rows; pair with a
// re-encryption job.
//
// Important: GCM is non-deterministic. Encrypted fields cannot be used in
// equality queries from Mongo (each write produces fresh ciphertext). Only
// encrypt fields that are read-then-matched in JS — never indexed/queried.

import crypto from "node:crypto";

const PREFIX = "v1:";

function loadKey(): Buffer {
  const b64 = process.env.FIELD_ENCRYPTION_KEY;
  if (b64) {
    const raw = Buffer.from(b64, "base64");
    if (raw.length !== 32) throw new Error(`FIELD_ENCRYPTION_KEY must decode to 32 bytes (got ${raw.length})`);
    return raw;
  }
  const seed = process.env.AUTH_SECRET ?? "dev-field-key";
  return crypto.createHash("sha256").update(seed).digest();
}

const KEY = loadKey();

export function sealField(plaintext: string): string {
  if (!plaintext) return plaintext;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64url");
}

export function openField(value: unknown): string {
  if (typeof value !== "string" || !value) return value as string;
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext row
  try {
    const packed = Buffer.from(value.slice(PREFIX.length), "base64url");
    if (packed.length < 12 + 16) return value;
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const ct = packed.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return value;
  }
}

// Mongoose schema field options factory: encrypted string with transparent
// get/set. Equality queries through mongoose are NOT supported — these
// fields must not appear in $match / find filters.
export function encryptedString(extra: Record<string, unknown> = {}) {
  return {
    type: String,
    default: "",
    set: (v: string) => (v ? sealField(v) : v),
    get: openField,
    ...extra,
  };
}
