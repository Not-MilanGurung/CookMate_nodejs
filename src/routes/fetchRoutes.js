const express = require('express');
const { addCuisine, fetchCuisines, addDishes, getDishes} = require('../controllers/fetchController');
const { validBsonId, verifyToken } = require('../middlewares/tokenMiddleware');
const upload  = require('../middlewares/multerMiddleware');

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

router.post('/chef/:id/cuisines/:name', validBsonId, verifyToken, upload.single('image'), addDishes);

/**
 * @description For getting dishes of chef
 * @access Public
 * @method GET
 * @returns { error }
 * @returns { message, dishes}
 */
router.get('/chef/:id/dishes', validBsonId, verifyToken, getDishes);

module.exports = router;
