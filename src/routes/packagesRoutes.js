const {createPackage, updatePackage, getPackages,deletePackage} = require('../controllers/packageController');
const {verifyToken, validBsonId} = require('../middlewares/tokenMiddleware');
const router = require('express').Router();

/**
 * @description Route to create package
 * @route /api/v1/packages
 * @body {name, price, description, dishes}
 * @access PUBLIC
 * @method POST
 * @returns {error}
 * @returns {message, package}
 */
router.post('', verifyToken, createPackage);

/**
 * @description Route to get package of a chef
 * @route /api/v1/packages/chef/:id
 * @access Public
 * @method GET
 * @returns {error}
 * @returns {message, packages}
 */
router.get('/chef/:id', validBsonId, verifyToken, getPackages);

/**
 * @description Route to update package
 * @route /api/v1/packages/:id
 * @access PUblic
 * @method PUT
 * @returns {error}
 * @returns {message, package}
 */
router.put('/:id',validBsonId, verifyToken, updatePackage);

/**
 * @description Route to delete package
 * @route /api/v1/packages/:id
 * @access Public
 * @method delete
 * @returns {error}
 * @returns {message}
 */
router.delete('/:id', validBsonId, verifyToken, deletePackage);

module.exports = router;