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

  // Get Avatar from user

  // console.log(req.files?.avatar[0]);
  //const avatarLocalPath = req.files?.avatar[0].path;
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar Not Found");
  // }

  // Upload on Cloudinary

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
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    createdUser._id,
  );

  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "Successfully Registered",
      ),
    );
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "error while generating access and refresh tokens");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // get data from req body
  // check username & email
  // find user
  // check password
  // generate access & refresh token
  // send cookies

  const { userName, email, password } = req.body;
  console.log(userName, email, password);

  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "username, email and password fields are required");
  }

  if (!userName && !email) {
    throw new ApiError(400, "username or email required");
  }

  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully",
      ),
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // console.log("this is req -> user : \n ", req.user);
  const { userName, email, fullName, isAdmin, phoneNumber } = req.body;
  if ([userName, email, fullName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "username, email and fullname are required fields");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName,
        fullName,
        email,
        isAdmin,
        phoneNumber,
      },
    },
    { new: true },
  ).select("-password");

  // console.log("this is updated user: \n ", updatedUser);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "account updated successfully"));
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const { _id, userName, email, password } = req.body;
  console.log(`We are going to delete ${userName} account with id ${_id}`);

  if ([_id, userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields Are Required");
  }

  if (!_id || !password) {
    throw new ApiError(400, "_id and password are required");
  }

  const user = await User.findById(_id);

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "password is incorrect");
  }

  const userDeleted = await User.deleteOne({ _id });
  console.log(user);
  return res
    .status(200)
    .json(new ApiResponse(200, userDeleted, "user deleted successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const loggedOutUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, // remove the field from document
      },
    },
    { new: true },
  ).select("-password -__v -createdAt -updatedAt -isAdmin");

  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", Options)
    .cookie("refreshToken", Options)
    .json(new ApiResponse(200, loggedOutUser, "user logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id).select(
    "-refreshToken -__v -isAdmin",
  );
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "old and new passwords required");
  }
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiResponse(400, "invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

export {
  registerUser,
  loginUser,
  updateAccountDetails,
  deleteUserAccount,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
};
