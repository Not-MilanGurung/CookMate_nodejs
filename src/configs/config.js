const  dotenv =  require('dotenv');
dotenv.config();
const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');


const sendOTP = async (email, otp) => {
  try{
    let emailAPI = new TransactionalEmailsApi();
    emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY
    let message = new SendSmtpEmail();
    message.subject = "CookMate OTP recovery";
    message.textContent = `The OTP to perform account recovery is \n${otp}\n This will expire in 5 mins`;
    message.sender = { name: "CookMate", email: process.env.EMAIL };
    message.to = [{ email: email }];

    await emailAPI.sendTransacEmail(message)
    return true
  } catch (err) {
    console.error('Error mailing', err);
    return false;
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
    MAILER : sendOTP,

    FAILURE_URL: process.env.FAILURE_URL,
    SUCCESS_URL: process.env.SUCCESS_URL,

    ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID,
    ESEWA_SECRET: process.env.ESEWA_SECRET,

    ESEWA_PAYMENT_URL: process.env.ESEWA_PAYMENT_URL,
    ESEWA_PAYMENT_STATUS_CHECK_URL: process.env.ESEWA_PAYMENT_STATUS_CHECK_URL
}

module.exports = config;