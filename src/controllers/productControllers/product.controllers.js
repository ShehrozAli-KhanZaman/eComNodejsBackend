import { Category } from "../../models/category.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { Product } from "../../models/product.model.js";
import mongoose from "mongoose";

const addProduct = asyncHandler(async (req, res) => {
  // console.log("Adding Products", req.body, req.user);

  // get data from req
  const { name, description, price, category, stock, brand, ratings } =
    req.body;

  // get user from middleware verifyJwt
  const owner = req.user;

  // check for product name and desc
  if (!name || !description) {
    throw new ApiError(409, "name and description are required");
  }

  // check for duplicate products
  const existingProduct = await Product.findOne({
    name: name.toLowerCase(),
    description,
    owner: owner._id,
  });
  if (existingProduct) {
    throw new ApiError(
      409,
      "Product with the same name and description already exists",
    );
  }

  // check for category , also check category is id or name
  if (!category) {
    throw new ApiError(409, "category field is required");
  }
  const categoryId = mongoose.Types.ObjectId.isValid(category);
  const categoryData = categoryId
    ? await Category.findById(categoryId)
    : await Category.findOne({ name: category });

  // send error if category not found
  if (!categoryData) {
    throw new ApiError(404, `category ${category} does not exist`);
  }

  // check that user exists or not
  if (!owner) {
    throw new ApiError(409, "user id is required");
  }
  const user = await User.findById(owner?._id);
  if (!user) {
    throw new ApiError(404, "user with this id not found");
  }

  // creat product
  const product = await Product.create({
    name: name.toLowerCase(),
    description,
    price,
    category: categoryData?._id || categoryData?.name,
    stock,
    brand,
    ratings,
    owner: user?._id,
  });

  if (!product) {
    throw new ApiError(500, "something went wrong while adding product");
  }

  const createdProduct = await Product.findById(product?._id).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, createdProduct, "product added successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  // check id in req body
  const _id = req.body;
  if (!_id) {
    throw new ApiError(409, "product id is missing");
  }
  // console.log(req.user?._id.toString());

  // this is advance check that if user requested to delete product is same with one associated with product
  const productOwner = await Product.findById(_id);

  // console.log(
  //   "this is the user/owner of product",
  //   productOwner?.owner?._id.toString(),
  // );

  if (productOwner?.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "you do not have permission to modify this product or owner not matched",
    );
  }

  // check respective product with id
  const product = await Product.findByIdAndDelete(_id);
  if (!product) {
    throw new ApiError(404, `product with this id  ${_id} not found`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product deleted successfully"));
});

export { addProduct, deleteProduct };
