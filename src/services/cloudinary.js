import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import { ApiError } from '../utils/ApiError.js'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localFilepath) => {
    try {
        if(!localFilepath) return null;
        const response = await cloudinary.uploader.upload(localFilepath, { resource_type: "auto" });
        fs.unlinkSync(localFilepath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilepath);
        throw new ApiError(500, "something went wrong while uploading file on clodinary");
    }
}