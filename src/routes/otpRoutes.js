const {changePassword, generateOTP, verifyOTP} =require('../controllers/otpController');
const {verifyToken} = require('../middlewares/tokenMiddleware');
const router = require('express').Router();

/**
 * @description Route to request an OTP
 * @access PUBLIC
 * @body { email}
 * @method POST
 * @returns {message}
 * @returns {error}
 */
router.post('/generate', generateOTP);

/**
 * @description Route to verify OTP 
 * @access Public
 * @body { email, otp}
 * @method POST
 * @returns {message, token},
 * @returns {error}
 */
router.post('/verify', verifyOTP);

/**
 * @description Route to change password with the token from the OTP
 * @access Public
 * @body {password}
 * @method POST
 * @returns {message}
 * @returns {error}
 */
router.post('/changePassword', verifyToken, changePassword );

module.exports = router;