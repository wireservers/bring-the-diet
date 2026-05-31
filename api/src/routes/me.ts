import { Router } from "express";
import { z } from "zod";
import { connectDb } from "../lib/db.js";
import { AuditLog } from "../models/AuditLog.js";
import { Session } from "../models/Session.js";
import { requireUser, requirePermission } from "../lib/auth.js";
import { asyncHandler, jsonError } from "../lib/http.js";
import { audit } from "../lib/audit.js";

const router = Router();
router.use(requireUser);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({
      id: req.user!.id,
      email: req.user!.email,
      name: req.user!.name,
      permissions: req.user!.permissions,
      roles: req.user!.roles,
    });
  }),
);

/** CCPA §1798.100(d) / GDPR Art. 20 — data portability. */
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    await connectDb();
    const userId = req.user!.id;
    const audits = await AuditLog.find({ userId }).sort({ at: -1 }).lean();
    audit(req, { action: "export", resource: "user_data", resourceId: userId, metadata: { audits: audits.length } });
    res.setHeader("Content-Disposition", `attachment; filename="bringthediet-export-${userId}.json"`);
    res.json({
      generatedAt: new Date().toISOString(),
      user: { id: userId, email: req.user!.email, name: req.user!.name },
      audits,
    });
  }),
);

/** CCPA §1798.105 / GDPR Art. 17 — right to be forgotten. Privileged. */
const DeleteAllSchema = z.object({ confirm: z.literal("delete my data") });

router.delete(
  "/data",
  requirePermission("diet:admin"),
  asyncHandler(async (req, res) => {
    const parsed = DeleteAllSchema.safeParse(req.body);
    if (!parsed.success) {
      return jsonError(res, 400, "confirmation_required", `Body must include {"confirm": "delete my data"}.`);
    }
    await connectDb();
    const userId = req.user!.id;
    // Wipe everything user-owned; preserve THIS audit row.
    await Session.deleteMany({ userId }).catch(() => undefined);
    await AuditLog.deleteMany({ userId, action: { $ne: "erase" } });
    audit(req, { action: "erase", resource: "user_data", resourceId: userId });
    res.json({ ok: true });
  }),
);

export default router;
