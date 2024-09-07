import { Category } from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// products CRUD & other operations

// Create Prodcut
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

// Read Product
const getAllProduct = asyncHandler(async (req, res) => {
  let pool = req.body.pool || req.query.pool || req.params.pool;
  const {
    name,
    description,
    _id,
    minPrice,
    maxPrice,
    category,
    brand,
    ratings,
  } = req.body || req.query || req.params;

  let searchCriteria = {};
  if (name) {
    searchCriteria.name = { $regex: name, $options: "i" };
  }
  if (description) {
    searchCriteria.description = { $regex: description, $options: "i" };
  }
  if (_id) {
    searchCriteria._id = _id;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    searchCriteria.price = { $gte: minPrice, $lte: maxPrice };
  }
  if (brand) {
    searchCriteria.brand = { $regex: brand, $options: "i" };
  }
  if (ratings) {
    searchCriteria.ratings = { $regex: ratings, $options: "i" };
  }
  if (category) {
    const isValidCategoryId = mongoose.Types.ObjectId.isValid(category);
    if (isValidCategoryId) {
      searchCriteria.category = isValidCategoryId.toString();
    }
  }

  // if not pool is user or all then set to all
  if (!pool) {
    pool = "all";
  }

  // find products according to pool variable
  const products =
    pool === "all"
      ? await Product.find(searchCriteria).select("-__v")
      : await Product.find({
          owner: req.user?._id.toString(),
        }).select("-__v");

  // check that products exits or not
  if (!products) {
    throw new ApiError(404, "no products found");
  }

  // send response after fetching
  return res
    .status(200)
    .json(new ApiResponse(200, products, "products fetched successfully"));
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  // get data from req body and check for name and desc
  const { _id, name, description, price, stock, brand, category, ratings } =
    req.body;
  const owner = req.user?._id;
  if (!_id || !name || !description) {
    throw new ApiError(409, "product name, _id or description is missing");
  }

  // check category
  const categoryId = mongoose.Types.ObjectId.isValid(category);
  const categoryData = categoryId
    ? await Category.findById(categoryId)
    : await Category.findOne({ name: category });

  // check category data exists or not
  if (!categoryData) {
    throw new ApiError(409, `category ${category} does not exists`);
  }

  // check for user id
  if (!owner) {
    throw new ApiError(409, "user id is required");
  }
  const user = await User.findById(owner);
  if (!user || user?._id.toString() !== owner.toString()) {
    throw new ApiError(409, "user not found or user id not matched");
  }

  //check the product exits or not
  const existingProduct = await Product.findById(_id);
  if (!existingProduct) {
    throw new ApiError(409, `product with id ${_id} not exist`);
  }

  //update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    {
      name: name.toLowerCase(),
      description,
      price,
      stock,
      brand,
      ratings,
    },
    { new: true },
  ).select("-__v");

  if (!updatedProduct) {
    throw new ApiError(409, "something went wrong while updating product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "product updated successfully"));
});

// Delete Products
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

export { addProduct, deleteProduct, getAllProduct, updateProduct };
