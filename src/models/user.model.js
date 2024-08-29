import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "UserName is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: [3, "UserName must be at least 3 characters long"],
      maxlength: [30, "UserName must be at most 30 characters long"],
    },
    fullName: {
      type: String,
      trim: true,
      minlength: [3, "UserName must be at least 3 characters long"],
      maxlength: [30, "UserName must be at most 30 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      // validate: {
      //   validator: function(v) {
      //       return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      //   },
      //   message: props => `${props.value} is not a valid email!`
      // }
    },
    phoneNumber: {
      type: String,
      // unique: true,
      default: null,
      // sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 3 characters long"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1, userName: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
