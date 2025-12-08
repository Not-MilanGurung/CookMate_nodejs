const {createBooking, getBooking, updateBookingStatus} = require('../controllers/bookingController');
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
router.get('',verifyToken, getBooking);

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

module.exports = router;
