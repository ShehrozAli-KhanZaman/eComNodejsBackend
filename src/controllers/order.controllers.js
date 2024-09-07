import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

// create order
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

// read order
const getOrder = asyncHandler(async (req, res) => {
  const user = req?.user?._id;
  const orders = await Order.find({ user: user.toString() });
  if (!orders) {
    throw new ApiError(401, "no order found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "orders fetched successfully"));
});

// update order
const updateOrder = asyncHandler(async (req, res) => {
  const {
    _id,
    orderItems,
    shippingAddress,
    shippingPrice,
    taxPrice,
    itemsPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    orderStatus,
  } = req?.body;

  if (!_id) {
    throw new ApiError(401, "order id is required");
  }

  const existingOrder = await Order.findById(_id);
  if (!existingOrder) {
    throw new ApiError(404, "Order not found");
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new ApiError(
      401,
      "order items array is required and cannot be empty",
    );
  }

  orderItems.forEach((item) => {
    if (item.price <= 0 || item.quantity <= 0) {
      throw new ApiError(401, "Item price or quantity must be greater than 0");
    }

    const orderItemIndex = existingOrder.orderItems.findIndex(
      (existingItem) => {
        // console.log(existingItem._id.toString());
        return existingItem._id.toString() === item._id;
      },
    );
    // console.log(orderItemIndex);
    // console.log(item._id);
    if (orderItemIndex >= 0) {
      // If item is found, update specific fields
      existingOrder.orderItems[orderItemIndex].name = item.name;
      existingOrder.orderItems[orderItemIndex].price = item.price;
      existingOrder.orderItems[orderItemIndex].quantity = item.quantity;
    } else {
      throw new ApiError(404, `Order item with ID ${item._id} not found`);
    }
  });

  existingOrder.shippingAddress =
    shippingAddress || existingOrder.shippingAddress;
  existingOrder.shippingPrice = shippingPrice || existingOrder.shippingPrice;
  existingOrder.taxPrice = taxPrice || existingOrder.taxPrice;
  existingOrder.itemsPrice = itemsPrice || existingOrder.itemsPrice;
  existingOrder.totalPrice = totalPrice || existingOrder.totalPrice;
  existingOrder.paymentMethod = paymentMethod || existingOrder.paymentMethod;
  existingOrder.isPaid = isPaid !== undefined ? isPaid : existingOrder.isPaid;
  existingOrder.orderStatus = orderStatus || existingOrder.orderStatus;

  const updatedOrder = await existingOrder.save();
  if (!updatedOrder) {
    throw new ApiError(409, "something went wrong while updating order");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "order updated successfully"));
});

// delete order
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId, itemId } = req?.query;
  if (!orderId) {
    throw new ApiError(401, "order id is required");
  }

  // case 1 : for deleting items in order
  if (itemId) {
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $pull: { orderItems: { _id: itemId } },
      },
      { new: true },
    );

    if (!updatedOrder) {
      throw new ApiError(401, "order or item not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedOrder, "order item deleted successfully"),
      );
  }

  // case 2 : for deleting whole order
  if (!itemId) {
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      throw new ApiError(409, "something went wrong while deleting order");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedOrder, "order deleted successfully"));
  }
});

export { placeOrder, getOrder, updateOrder, deleteOrder };
