const express = require('express');
const { addCuisine, fetchCuisines, addDishes} = require('../controllers/fetchController');
const { validBsonId, verifyToken } = require('../middlewares/tokenMiddleware');

const router = express.Router();

/**
 * @description For adding cuisines if you are a admin
 * @access Private
 * @body { name, dishes}
 * @method POST
 * @returns { error }
 * @returns { message, cuisine}
 */
router.post('/cuisines', verifyToken, addCuisine);

/**
 * @description For fetching all the cuisines
 * @access Public
 * @method GET
 * @return {cuisines}
 * @returns {error}
 */
router.get('/cuisines', verifyToken, fetchCuisines);

/**
 * @description For adding to overwriting dishes of a cuisine
 * @access Private
 * @body { dishes, overwrite}
 * @method POST
 * @returns { error }
 * @returns { message, cuisine}
 */

router.post('/cuisines/:name', verifyToken, addDishes);

module.exports = router;
