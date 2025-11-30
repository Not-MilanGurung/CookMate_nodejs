const cloudinary = require('cloudinary').v2;
const config = require('../configs/config');

cloudinary.config({ 
    cloud_name: config.CLOUDINARY_CLOUD_NAME, 
    api_key: config.CLOUDINARY_API_KEY, 
    api_secret: config.CLOUDINARY_API_SECRET 
});

const uploadProfilePic = async (filePath, userId) =>{
    try{
        const result = await cloudinary.uploader
                .upload(filePath, {
                    folder: "profilePics",
                    public_id: userId,
                    overwrite: true,
                    resource_type: 'image'
                })
                .catch((error) => {
                    console.log(error);
                });

        const optimizeUrl = cloudinary.url('profilePics/'+userId, {
                fetch_format: 'auto',
                quality: 'auto',
                crop: 'auto',
                width: 300,
                height: 300,
                gravity: 'face'
            });
            console.log(result);
        return result.secure_url;
    }catch (error){
        console.log(error);
        return null;
    }
    
};

const uploadFoodPic = async (filePath, foodId, userId) => {
    await cloudinary.uploader
            .upload(filePath, {
                folder: "foodPics",
                public_id: foodId + userId,
                resource_type : 'image',
                overwrite: true
            })
            .catch((error) => {
                console.log(error);
            });
    
    const foodWide = cloudinary.url('foodPics/'+foodId+userId, {
        width: 800,
        height: 450,
        crop: "fill",
        fetch_format: "auto",
        quality: "auto"
        });
    return foodWide
};

module.exports = { uploadFoodPic, uploadProfilePic};