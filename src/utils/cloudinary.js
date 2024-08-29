import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import ApiError from "./ApiError.js";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteFromCloudinary = async (localFilePath) => {
  let imageFile = localFilePath || "lkkhymqffzsaecd3i1ck";
  console.log(`this is image we are going to delete ${imageFile}`);
  try {
    if (!imageFile) {
      throw new ApiError(400, "file is missing");
    }
    const response = await cloudinary.uploader.destroy(imageFile, {
      resource_type: "image",
    });

    return response;
  } catch (error) {
    console.log("error occured while deleting file from cloud ,   ", error);
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log("This is File Url : ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    // console.log("not getting proper local path \n", localFilePath, error);
    return null;
  }
};

export default uploadOnCloudinary;
