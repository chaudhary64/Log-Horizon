import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  order: number;
  userId: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema(
  {
    url: { type: String, required: true },
    category: { type: String, required: true },
    previewImage: { type: String },
    previewTitle: { type: String },
    previewDescription: { type: String },
    order: { type: Number, required: true, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
