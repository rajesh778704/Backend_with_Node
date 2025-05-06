import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from "fs";

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    });
    
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) {
                return null;
            }
            
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            });
    
            //await fs.unlinkSync(localFilePath)
            try {
                await fs.unlink(localFilePath);  // Attempt to delete the local file
            } catch (unlinkError) {
                console.error("Error removing file:", unlinkError.message);  // Log unlink error
            }
            return response;
        } catch (error) {
            console.error("Error during file upload:", error.message);
            
            try {
                await fs.unlinkSync(localFilePath);  // Attempt to delete the local file
            } catch (unlinkError) {
                console.error("Error removing file:", unlinkError.message);  // Log unlink error
            }
    
            return null;
        }
    };

export {uploadOnCloudinary};
   