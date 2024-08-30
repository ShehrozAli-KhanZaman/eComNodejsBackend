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

export { addCategory };
