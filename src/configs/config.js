const dotenv = require('dotenv');
dotenv.config();

const config = {
    PORT : process.env.PORT || 5000,
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    JWT_EXPIRATION : process.env.JWT_EXPIRATION,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET
}

module.exports = config;