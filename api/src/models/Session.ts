import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SessionSchema = new Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true, index: true },
    payload: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, _id: false },
);

export type SessionDoc = InferSchemaType<typeof SessionSchema> & { _id: string };
export const Session = (mongoose.models.Session as mongoose.Model<SessionDoc>) ||
  mongoose.model<SessionDoc>("Session", SessionSchema);
