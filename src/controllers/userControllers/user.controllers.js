import asyncHandler from "../../utils/asyncHandler.js";
import { User } from "../../models/userModels/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import uploadOnCloudinary from "../../utils/cloudinary.js";

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

  const { userName, fullName, email, password, isAdmin, phoneNumber } =
    req.body;
  // console.log(userName, fullName, email, password);

  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }
  // console.log(req.files?.avatar[0]);
  // const avatarLocalPath = req.files?.avatar[0].path;

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar Not Found");
  // }

  //Upload on Cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("this is the avatar", avatar);

  // if (!avatar) {
  //   throw new ApiError(400, "Error While Uploading Avatar To Cloud");
  // }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    // avatar: avatar.url || "",
    isAdmin,
    phoneNumber: phoneNumber || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // console.log(createdUser);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "Successfully Registered"));
});

export { registerUser };
