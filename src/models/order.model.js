import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: { type: String },
        price: { type: Number, required: true, default: 0 },
        quantity: { type: Number, default: 0, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    itemsPrice: {
      type: Number,
      default: 0,
      required: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
      required: true,
    },
    taxPrice: {
      type: Number,
      //   required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      //   required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    orderStatus: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
