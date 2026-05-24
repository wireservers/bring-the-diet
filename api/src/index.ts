import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./env.js";
import { connectDb } from "./lib/db.js";
import { globalLimiter, requireSameOrigin } from "./lib/protect.js";

import msalRouter from "./routes/msal.js";
import meRouter from "./routes/me.js";
import recipesRouter from "./routes/recipes.js";
import foodsRouter from "./routes/foods.js";
import mealplansRouter from "./routes/mealplans.js";
import dietsRouter from "./routes/diets.js";
import blogRouter from "./routes/blog.js";
import favoritesRouter from "./routes/favorites.js";
import progressRouter from "./routes/progress.js";
import uploadRouter from "./routes/upload.js";

const app = express();

// Behind Azure App Service's reverse proxy; trust one hop so req.ip is real
// (matters for rate limiting + same-origin checks).
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Cross-origin web + native clients on env.appUrl need credentialed CORS.
app.use(
  cors({
    origin: env.appUrl,
    credentials: true,
  }),
);

app.use(requireSameOrigin);
app.use(globalLimiter);

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/msal", msalRouter);
app.use("/api/me", meRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/foods", foodsRouter);
app.use("/api/mealplans", mealplansRouter);
app.use("/api/diets", dietsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/upload", uploadRouter);

connectDb().catch((err) => console.error("[boot] db connect failed", err));

app.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port}`);
});
