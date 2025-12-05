const {createBooking, getBooking, updateBookingStatus} = require('../controllers/bookingController');
const {verifyToken} = require('../middlewares/tokenMiddleware');
const router = require('express').Router();

/**
 * @description Route to create a booking
 * @route /api/v1/bookings
 * @access Public
 * @method Post
 * @body { chefId, eventType, date, timeInterval, noOfPeople, packages }
 * @returns {error}
 * @returns { message, booking}
 */
router.post('', verifyToken, createBooking);

module.exports = router;
