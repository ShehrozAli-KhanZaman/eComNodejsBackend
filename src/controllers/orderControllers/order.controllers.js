import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const user = req?.user?._id;
  const {
    orderItems,
    shippingAddress,
    totalPrice,
    taxPrice,
    shippingPrice,
    itemsPrice,
    isPaid,
    paymentMethod,
  } = req.body;

  if (!paymentMethod) {
    throw new ApiError(401, "payment method is missing");
  }

  if (!itemsPrice || !totalPrice) {
    throw new ApiError(401, "itmes price and total price are required fields");
  }

  if (
    !shippingAddress?.country ||
    !shippingAddress?.city ||
    !shippingAddress?.address
  ) {
    throw new ApiError(401, "country, city or address is in shipping address");
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new ApiError(
      401,
      "order items array is required and cannot be empty",
    );
  }

  for (const item of orderItems) {
    if (!item.price || item.price <= 0) {
      throw new ApiError(401, "price is required and must be greater than 0");
    }

    if (!item.quantity || item.quantity <= 0) {
      throw new ApiError(
        401,
        "quantity is required and must be greater than 0",
      );
    }

    if (!item.product) {
      throw new ApiError(401, "product reference id is required");
    }

    const findProductById = await Product.findById(item.product);
    if (!findProductById) {
      throw new ApiError(
        409,
        `product with this id ${item.product} does not exist`,
      );
    }
  }

  const order = await Order.create({
    orderItems,
    totalPrice,
    shippingPrice,
    taxPrice,
    isPaid: false,
    orderStatus: "Processing",
    shippingAddress,
    paymentMethod,
    itemsPrice,
    user,
  });

  if (!order) {
    throw new ApiError(401, "something went wrong while placing order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "order placed successfully"));
});

export { placeOrder };
