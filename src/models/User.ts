import mongoose, { Schema, Document } from "mongoose";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  categories: string[];
  hiddenCategories: string[];
  categoryAliases: Record<string, string>;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    categories: { type: [String], default: DEFAULT_CATEGORIES },
    hiddenCategories: { type: [String], default: [] },
    categoryAliases: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
