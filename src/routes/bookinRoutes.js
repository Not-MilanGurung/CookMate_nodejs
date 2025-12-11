const {createBooking, getBookings, updateBookingStatus, getRecentBooking, rateBooking} = require('../controllers/bookingController');
const {verifyToken, validBsonId} = require('../middlewares/tokenMiddleware');
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

/**
 * @description Route to get bookings
 * @route /api/v1/bookings
 * @access Public
 * @method GET
 * @query {userType}
 * @returns {error}
 * @returns {bookings}
 */
router.get('',verifyToken, getBookings);

/**
 * @description Route to get the most recent booking
 * @route /api/v1/booking/recent
 * @access Public
 * @method GET
 * @returns {error}
 * @returns {booking}
 */
router.get('/recent', verifyToken, getRecentBooking);

/**
 * @description Route to update booking status
 * @route /api/v1/bookings/:id
 * @access Public
 * @method PUT
 * @body { status }
 * @returns {message}
 * @returns {error}
 */
router.put('/:id', validBsonId, verifyToken, updateBookingStatus);

/**
 * @description Route to rate and review booking
 * @route /api/v1/booking/:id/rate
 * @access Public
 * @method Post
 * @body {rating, review}
 * @returns {message}
 * @returns {error}
 */
router.post('/:id/rate', validBsonId, verifyToken, rateBooking);

module.exports = router;
