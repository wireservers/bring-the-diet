import { Router } from "express";
import { requireUser, requirePermission } from "../lib/auth.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();
router.use(requireUser);

router.get("/",       requirePermission("diet:foods:read"),  asyncHandler(async (_req, res) => { res.json({ items: [], notImplemented: true }); }));
router.get("/:id",    requirePermission("diet:foods:read"),  asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.post("/",      requirePermission("diet:foods:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.put("/:id",    requirePermission("diet:foods:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));
router.delete("/:id", requirePermission("diet:foods:write"), asyncHandler(async (_req, res) => { res.status(501).json({ error: "not_implemented" }); }));

export default router;
