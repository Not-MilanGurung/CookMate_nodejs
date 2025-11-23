const config = require('../configs/config');
const User = require('../models/user_model');
const  { uploadProfilePic, uploadFoodPic } = require('../services/imageServices');

const saveProfilePic = async (req, res) => {
    try {
        const userId = req.userId;
        const { path } = req.body;

        const url = await uploadProfilePic(path, userId);
        if (!url){
            res.status(400).json({ error: "Could not save upload image"});
        }
        await User.updateOne({ _id : userId}, { urlToImage : url});
        return res.status(200).json({ message: "Profile image uploaded", url});

    }catch (error) {
        console.error("Error Saving image:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
}


module.exports = { saveProfilePic };

