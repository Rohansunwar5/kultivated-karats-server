import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, fileType) => {
    try {
        let folderName = "";
        switch (fileType) {
            case "blogCover":
                folderName = "blogs"
            break;
            case "productImages":
                folderName = "products"
            break;
            case "bannerImage":
            case "bannerElement":
                folderName = "banners"
            break;    
        }
        if ( !localFilePath ) throw new Error("File path not found!");

        // console.log(fileType, folderName);

        const response = await cloudinary.uploader.upload(localFilePath, { folder: `daadis.in/${folderName}` , resource_type: "auto" });
        console.log("File uploaded to cloudinary!");
        
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return error;        
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        
        if ( !publicId ) throw new Error("Public id not present!")

        const response = await cloudinary.uploader.destroy(publicId);
        
        if ( !response ) throw new Error("Error while delting file")

        return response;

    } catch (error) {   
        return error;        
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };