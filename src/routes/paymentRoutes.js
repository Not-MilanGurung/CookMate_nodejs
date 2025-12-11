const router = require('express').Router();
const { initiatePayment, paymentStatus, paymentFailureHandler, paymentSuccessHandler} = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/tokenMiddleware');

router.post('/initiate',verifyToken, initiatePayment);

router.post('/status',verifyToken, paymentStatus);

router.all('/success', paymentSuccessHandler);

router.all('/failure', paymentFailureHandler)

module.exports = router;