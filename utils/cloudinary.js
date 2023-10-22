const cloudinary = require("cloudinary");

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    });


    //cloudinary upload image
    const cloudinaryUploadImage = async(fileToUpload)=>{

        try{
        const data = await cloudinary.uploader.upload(fileToUpload,{
            resource_type: 'auto'
        });
        return data;
        }catch(error){
            throw new Error("internal server error (coudainary)")
        }

    }

    //cloudinary remove image
    const cloudinaryRemoveImage = async(imagePublicId)=>{

        try{
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return result;
        }catch(error){
            throw new Error("internal server error (coudainary)")
        }
    }

    //cloudinary remove many images
    const cloudinaryRemoveManyImages = async(imagePublicIds)=>{

        try{
        const result = await cloudinary.v2.api.delete_resources(imagePublicIds)
        return result;
        }catch(error){
            throw new Error("internal server error (coudainary)")
        }
    }

    module.exports = {cloudinaryRemoveManyImages,cloudinaryUploadImage, cloudinaryRemoveImage}