const express = require('express');
const { register, login, deleteUser, getUser, updateUser } = require("../controllers/authcontroller");
const {validBsonId, verifyToken }= require('../middlewares/tokenMiddleware');
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
router.post("/users/:id", validBsonId, verifyToken, updateUser)


module.exports = router;