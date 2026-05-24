import mongoose from "mongoose";
import { env } from "../env.js";

let conn: typeof mongoose | null = null;
let promise: Promise<typeof mongoose> | null = null;

export async function connectDb() {
  if (conn) return conn;
  if (!promise) {
    promise = mongoose.connect(env.mongoUri, {
      dbName: env.dbName,
      retryWrites: false,
      maxIdleTimeMS: 120_000,
    });
  }
  conn = await promise;
  return conn;
}
