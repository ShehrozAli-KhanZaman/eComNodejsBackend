import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { Category } from "../../models/category.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const addCategory = asyncHandler(async (req, res) => {
  const { name, description, slug } = req.body;
  if (!name) {
    throw new ApiError(401, "category name is missing");
  }

  const existedCategory = await Category.findOne({ name });
  if (existedCategory) {
    throw new ApiError(409, "category already exists");
  }

  const category = await Category.create({
    name: name.toLowerCase(),
    description,
    slug,
  });
  const createdCategory = await Category.findById(category._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdCategory, "category created successfully"),
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  // fetch data from req body
  // check for existing category
  // if not found then send not found
  // search and update category
  // return res

  const { _id, name, description, slug } = req.body;
  if ([_id, name].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "category _id or name required");
  }

  if (!_id || !name) {
    throw new ApiError(401, "category _id and name are required");
  }

  const category = await Category.findByIdAndUpdate(
    _id,
    {
      name: name.toLowerCase(),
      description,
      slug,
    },
    { new: true },
  ).select("-__v");
  if (!category) {
    throw new ApiError(404, "category does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "category updated successfully"));
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).select("-__v");
  if (!categories) {
    throw new ApiError(404, "categories not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "categories fetched successfully"));
});

export { addCategory, updateCategory, getAllCategory };
