const router = require('express').Router();
const { initiatePayment, paymentStatus} = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/tokenMiddleware');

router.post('/initiate',verifyToken, initiatePayment);

router.post('/status',verifyToken, paymentStatus);

module.exports = router;