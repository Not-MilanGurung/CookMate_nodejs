const postController = require('../controllers/postController');
const upload = require('../middlewares/multerMiddleware');
const { verifyToken, validBsonId } = require('../middlewares/tokenMiddleware');
const router = require('express').Router();

/**
 * @description Route to create posts
 * @access Public
 * @method POST
 * @body { title, description, image}
 * @returns {error}
 * @returns {message, post}
 */
router.post('/', verifyToken, upload.single('image'), postController.createPost);

/**
 * @description Route to get posts
 * @access Public
 * @method GET
 * @boud {skip}
 * @returns { error}
 * @returns { posts}
 */
router.get('/', verifyToken, postController.getPosts);

/**
 * @description Route to get post by id
 * @access Public
 * @method GET
 * @body 
 * @returns {error}
 * @returns { liked, postData}
 */
router.get('/:id', validBsonId, verifyToken, postController.getPostById);
/**
 * @description Route to update post
 * @access Public
 * @method POST
 * @body { title, description, image}
 * @returns { error }
 * @returns { message}
 */
router.put('/:id', validBsonId, verifyToken, upload.single('image'),postController.updatePost);

/**
 * @description Route to delete post
 * @access Public
 * @method DELETE
 * @returns { message}
 * @returns { error }
 */

router.delete('/:id', validBsonId, verifyToken, postController.deletePost);

/**
 * @description Route to like and unlike post
 * @access Public
 * @method POST
 * @returns { message}
 * @returns { error }
 */
router.post('/:id/like', validBsonId, verifyToken, postController.likeUnlikePost);

/**
 * @description Route to creatte a comment
 * @access Public
 * @method POST
 * @body { text}
 * @returns { message}
 * @returns { error}
 */
router.post('/:id/comment', validBsonId, verifyToken, postController.createComment);

/**
 * @description Route to update a comment
 * @access Public
 * @method POST
 * @body { text }
 * @returns {error}
 * @returns {message, comment}
 */
router.put('/comment/:id', validBsonId, verifyToken, postController.updateComment);

/**
 * @description Route to delete a comment
 * @access Public
 * @method DELETE
 * @returns { message}
 * @returns {error}
 */
router.delete('/comment/:id', validBsonId, verifyToken, postController.deleteComment);

module.exports = router;