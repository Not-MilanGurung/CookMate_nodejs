const User = require("../models/user_model");
const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const { uploadProfilePic } = require('../services/imageServices');

const register = async (req, res) => {
    try{
        const {fullName, email, password, phoneNumber, signInMethod, role} = req.body;

        if (!fullName || !email || !password || !phoneNumber || !signInMethod){
            return res.status(400).json({ error: "All fields are required"});   
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res.status(400).json({ error: "User already exists"});
        }

        const user = new User({
            fullName,
            email,
            password,
            phoneNumber,
            signInMethod
        });
        if (role) user.role = role;
        await user.save();
        // Never send back password
        const userData = user.toJSON();
        delete userData.password;
        // const userData = {
        //   id: user._id,
        //   fullName: user.fullName,
        //   email: user.email,
        // };
        return res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }

};

const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password){
            return res.status(400).json({ error: "Email and password are required"});
        }

        const user = await User.findOne({ email });
        if (!user){
            return res.status(400).json({ error: "Invalid email or password"});
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch){
            return res.status(400).json({ error: "Invalid email or password"});
        }

        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRATION,
        });

        // Exclude password before sending back user data
        const { password: _, ...userData } = user.toObject();

        res.status(200).json({
            message: "Login successful",
            token,
            user: userData, // optional
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
};

const updateUser = async (req, res) => {
    try{
        const userId = req.userId;
        const { id } = req.params;
        const {fullName, phoneNumber, role, geoPoint, userAddress} = req.body;

        if (!fullName && !phoneNumber && !role && !geoPoint && !userAddress){
            return res.status(400).json({ error: "An updated field is required"});
        }
        if (userId != id){
            return res.status(402).json({error: "You can not update someone else's account"});
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (fullName){
            user.fullName = fullName;
        }

        if (phoneNumber){
            user.phoneNumber = phoneNumber;
        }

        if (role) {
            user.role = role;
        }

        if (geoPoint){
            user.geoPoint = geoPoint;
        }

        if (userAddress){
            user.userAddress = userAddress;
        }

        await user.save();
        return res.status(200).json({ message: 'User updated successfully'});

    }catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// controller functions to delete a user by ID (optional enhancement) --- IGNORE ---
const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (userId != id){
        return res.status(402).json({error: "You can not delete someone else's account"});
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
} catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Server error. Please try again later." });
}
};

const getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (userId != id){
            return res.status(402).json({error: "You can not get data for someone else's account"});
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

    // if (user._id.equals())
        return res.status(200).json({ user });
  }catch (error) {
    console.error("Error fetching a user:", error);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
}

const changeEmail = async (req, res) => {
    try{
        const userId = req.userId;
        const { id } = req.params;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "You need to provide a new email"});
        }
        if (userId != id){
            return res.status(402).json({error: "You can not update someone else's account"});
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.email = email;
        await user.save();
        return res.status(200).json({ message: "Successfully changed email", email});
    } catch (e){
        console.error("Error changing email:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}

const updateProfilePic = async (req, res) => {
    try{
        const userId = req.userId;
        const { id } = req.params;
        const image  = req.file;
        if (!image) {
            return res.status(400).json({ error: "You need to provide a new profile pic"});
        }
        if (userId != id){
            return res.status(402).json({error: "You can not update someone else's account"});
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const imageURL = await uploadProfilePic(image.path, userId);
        if (!imageURL){
            return res.status(400).json({ error: "Could not upload the image"});
        }
        user.urlToImage = imageURL;

        await user.save();
        return res.status(200).json({ message: "Successfully updated profile pic", urlToImage: imageURL});

    } catch (e) {
        console.error("Error changing email:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}
// export the controller functions
module.exports = { register, login, deleteUser, getUser, updateUser, changeEmail , updateProfilePic};