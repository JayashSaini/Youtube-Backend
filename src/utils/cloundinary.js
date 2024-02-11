import { v2 as cloudinaryv2 } from "cloudinary";
import cloudinary from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinaryv2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteVideoonCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }
    let response = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: "video",
    });
    return response;
  } catch (error) {
    return null;
  }
};
const deleteImageonCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }
    let response = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    return null;
  }
};
export { uploadOnCloudinary, deleteImageonCloudinary, deleteVideoonCloudinary };
