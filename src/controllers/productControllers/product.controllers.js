import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const addProduct = asyncHandler(async (req, res) => {
  console.log("Adding Products");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "product added successfully"));
});

export { addProduct };
