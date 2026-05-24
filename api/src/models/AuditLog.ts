import mongoose, { Schema, type InferSchemaType } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, default: null, index: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: null },
    success: { type: Boolean, default: true },
    at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

AuditLogSchema.index({ userId: 1, at: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, at: -1 });

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };
export const AuditLog = (mongoose.models.AuditLog as mongoose.Model<AuditLogDoc>) ||
  mongoose.model<AuditLogDoc>("AuditLog", AuditLogSchema);
