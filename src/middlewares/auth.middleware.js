import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/userModels/user.model.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Auth-Token");
    // console.log("Cookies data", req.cookies?.accessToken);
    // console.log("Headers Data", req.header("Auth-Token"));

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log("this is decoded token : \n", decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

export default verifyJwt;
