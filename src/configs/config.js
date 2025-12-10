const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendOTP = async (email, otp) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,         // Your Gmail
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const result = await transporter.sendMail({
      from: `CookMate <${process.env.EMAIL}>`,
      to: email,
      subject: "CookMate Account Recovery OTP",
      text: `The otp to recover you account is ${otp}\nThis expires in 5 minutes`,
    });

    return true;
  } catch (err) {
    console.error(err);
    return false
  }
}

const config = {
    PORT : process.env.PORT || 5000,
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    JWT_EXPIRATION : process.env.JWT_EXPIRATION,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,
    EMAIL : process.env.EMAIL,
    MAILER : sendOTP
}

module.exports = config;