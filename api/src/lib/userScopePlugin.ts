import type { Schema } from "mongoose";

/**
 * Mongoose plugin: every query against a user-owned collection must include a
 * `userId` filter. Forgetting one is a cross-tenant data leak waiting to
 * happen, so we fail loud the moment it's missed instead of silently
 * returning another user's rows.
 *
 * Applied to financial-data models (Account, Debt, Transaction, Budget).
 * Intentionally does NOT auto-inject the userId — the right value lives in
 * the request context and must be passed explicitly. This is a guard, not
 * a convenience.
 */
const guardedOps = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
  "count",
  "countDocuments",
] as const;

export function requireUserScope(schema: Schema): void {
  for (const op of guardedOps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema.pre(op as any, function (this: any) {
      const filter = this.getQuery?.() ?? this.getFilter?.();
      if (!filter || filter.userId === undefined) {
        const model = this.model?.modelName ?? "?";
        throw new Error(
          `[scope] refusing ${op} on ${model} without userId filter — ` +
            `this would leak data across tenants.`,
        );
      }
    });
  }
}
