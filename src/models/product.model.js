import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    productImage: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
    },
    ratings: {
      type: String,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", category: "text", owner: "text" });

export const Product = mongoose.model("Product", productSchema);
