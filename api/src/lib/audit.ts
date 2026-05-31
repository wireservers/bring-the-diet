import type { Request } from "express";
import { AuditLog } from "../models/AuditLog.js";
import { shipAuditEvent } from "./auditSink.js";

export type AuditEvent = {
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: unknown;
  success?: boolean;
};

/**
 * Fire-and-forget audit write. Caller doesn't await — a failed audit must not
 * fail the underlying request, but it is logged so it surfaces in monitoring.
 *
 * SOC 2 expects audit logs for: who did what, to which resource, when, from
 * where. We capture user id+email, action, resource+id, ip, UA, and arbitrary
 * metadata (e.g. diff summary, file name). Mongo's _id timestamp gives us the
 * server-side time independent of any client-supplied date.
 */
export function audit(req: Request, event: AuditEvent): void {
  const user = req.user;
  if (!user) return;
  const doc = {
    userId: user.id,
    userEmail: user.email ?? "",
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId ?? null,
    ip: (req.ip ?? "").slice(0, 64),
    userAgent: String(req.get("user-agent") ?? "").slice(0, 256),
    metadata: event.metadata ?? null,
    success: event.success ?? true,
  };
  AuditLog.create(doc).catch((err) => {
    console.error("[audit] write failed", { action: event.action, resource: event.resource, err });
  });
  // Secondary shipment to the immutable blob sink (no-op if unconfigured).
  shipAuditEvent(doc);
}
