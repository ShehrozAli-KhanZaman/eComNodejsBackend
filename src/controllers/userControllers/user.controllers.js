import asyncHandler from "../../utils/asyncHandler.js";
import { User } from "../../models/userModels/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { userName, fullName, email, password } = req.body;
  //   console.log(userName, fullName, email, password);

  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  const user = await User.create({
    userName,
    fullName,
    email,
    password,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user,
      },
      "Successfully Registered",
    ),
  );
});

export { registerUser };
