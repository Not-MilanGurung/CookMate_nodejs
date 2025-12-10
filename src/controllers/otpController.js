const {OTP} = require('../models/otpModel');
const {User} = require('../models/user_model');
const otpGenerator = require('otp-generator');

const config = require('../configs/config');
const jwt = require('jsonwebtoken');

const generateOTP = async (req, res) => {
    try{
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Insuffecient fields"});
        }
        const user = await User.findOne({email});
        if (!user){
            return res.status(404).json({error: "Account with the email not found"});
        }
        const otp = otpGenerator.generate(6, {digits: true, upperCaseAlphabets: true, lowerCaseAlphabets: false, specialChars: false});
        await OTP.create({email, otp});

        const success = await config.MAILER(user.email, otp);
        if (!success){
            throw {message: " Error mailing"};
        }
        return res.status(200).json({message: "OTP sent to the email succesfully"});
        
    } catch (e) {
        console.error("Error requesting OTP", e);
        return res.status(500).json({error: "Internal server error. Please try again later."});
    }
};

const verifyOTP = async (req, res) => {
    try{
        const { email, otp } = req.body;
        if (!otp || !email){
            return res.status(400).json({error: "Insuffecient fields"});
        }
        const otpRecord = await OTP.findOne({ email, otp}).exec();
        if (!otpRecord){
            return res.status(404).json({ error: "Invalid token or expired"});
        }
        const user = await User.findOne({email: otpRecord.email});
        if (!user){
            return res.status(404).json({ error: "The user no longer exists"});
        }
        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
            expiresIn: '5m',
        });
        return res.status(200).json({ message: "OTP verified. Create a new password", token});

    } catch (e) {
        console.error("Error verifying OTP", e);
        return res.status(500).json({ error: "Internal server error. Please try again later"});
    }
};

const changePassword = async (req,res) => {
    try{
        const userId = req.userId;
        const {password} = req.body;
        if (!password){
            return res.status(400).json({error: 'Insuffecient fields'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found'});
        }
        user.password = password;
        await user.save();
        return res.status(200).json({message: "Password changed succesfully"});
    } catch (e) {
        console.error("Error changing password: ",e);
        return res.status(500).json({ error: "Internal server error. Please try again later"});
    }
};

module.exports = {generateOTP, verifyOTP, changePassword};