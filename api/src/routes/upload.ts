import { Router } from "express";
import { requireUser, requirePermission } from "../lib/auth.js";
import { asyncHandler } from "../lib/http.js";
import { llmLimiter } from "../lib/protect.js";

const router = Router();
router.use(requireUser);

// Document / image upload + parse. Rate-limited because LLM calls are
// expensive; permission-gated because we don't want anonymous quota burn.
router.post(
  "/",
  llmLimiter,
  requirePermission("diet:upload"),
  asyncHandler(async (_req, res) => {
    res.status(501).json({ error: "not_implemented" });
  }),
);

export default router;
