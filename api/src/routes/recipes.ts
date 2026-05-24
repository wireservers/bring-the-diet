import { Router } from "express";
import { requireUser, requirePermission } from "../lib/auth.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();
router.use(requireUser);

// Stub: full implementation pending migration of wsapi recipe routes into
// this service. Auth + perm gating is wired so the integration is live.
router.get("/",       requirePermission("diet:recipes:read"),  asyncHandler(async (_req, res) => { res.json({ items: [], notImplemented: true }); }));
router.get("/:id",    requirePermission("diet:recipes:read"),  asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.post("/",      requirePermission("diet:recipes:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.put("/:id",    requirePermission("diet:recipes:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.delete("/:id", requirePermission("diet:recipes:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.post("/:id/publish", requirePermission("diet:recipes:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));

export default router;
