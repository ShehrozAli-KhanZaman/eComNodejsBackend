import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: "text" });

export const Category = mongoose.model("Category", categorySchema);
