const express = require('express');
const { register, login, deleteUser, getUser, updateUser, changeEmail } = require("../controllers/authcontroller");
const { saveProfilePic } = require('../controllers/imagecontroller');
const {validBsonId, verifyToken, tokenExpired }= require('../middlewares/tokenMiddleware');
const router = express.Router();

/**
 * @description routes for register
 * @route /api/v1/auth/register
 * @access Public
 * @method POST
 * @body { username, email, password, phoneNumber }
 * @returns { message, user}
 * @returns { error }
 */
router.post("/register", register);

/**
 * @description routes for login
 * @route /api/v1/auth/login
 * @access Public
 * @method POST
 * @body { email, password }
 * @returns { message, token, user }
 * @returns { error }
 */

router.post("/login", login);

/**
 * @description routes for deleting user
 * @route /api/v1/auth/users/:id
 * @access Public
 * @method POST
 * @returns { message }
 * @returns { error }
 */
router.delete("/users/:id", validBsonId, verifyToken,deleteUser);

/**
 * @description routes for getting profile
 * @route /api/v1/auth/users/:id
 * @access Public
 * @method GET
 * @returns { user }
 * @returns { error }
 */
router.get("/users/:id", validBsonId, verifyToken, getUser);

/**
 * @description routes to update profile
 * @route /api/v1/auth/users/:id
 * @access Public
 * @body {fullName, role, geoPoint, }
 * @method POST
 * @returns { message }
 * @returns { error }
 */
router.post("/users/:id", validBsonId, verifyToken, updateUser);

/**
 * @description routes to change email
 * @route /api/v1/auth/users/:id/email
 * @access Public
 * @body { email }
 * @method POST
 * @returns { message, email}
 * @returns { error}
 */
router.post('/users/:id/email', validBsonId, verifyToken, changeEmail);

/**
 * @description routes to update profile image
 * @route /api/v1/auth/users/:id/pic
 * @access Public
 * @body { path }
 * @method POST
 * @returns { message, url }
 * @returns { error }
 */
router.post("/users/:id/pic", validBsonId, verifyToken, saveProfilePic);

/**
 * @description Verify token validity
 * @route /api/v1/auth/verifyToken
 * @access Public
 * @header { Authorization: token}
 * @method POST
 * @returns { message, expries}
 * @returns {error}
 */
router.post('/verifyToken', tokenExpired);

module.exports = router;