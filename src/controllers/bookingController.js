const {Booking, bookingStatusEnum} = require('../models/bookingModel');
const {User , rolesEnum} = require('../models/user_model');
const Package = require('../models/packageModel');
const mongoose = require('mongoose');

const createBooking = async (req, res) => {
    try{
        const userId = req.userId;
        const { chefId, eventType, date, timeInterval, noOfPeople, packages } = req.body;
        
        if (noOfPeople < 1) {
            return res.status(400).json({error: "The number of people must be greater than 0"});
        }
        if (!chefId || !eventType || !date || !timeInterval || !noOfPeople || !packages ){
            return res.status(400).json({ error: "All fields are required"});
        }
        const customer = await User.findById(userId);
        if (!customer) {
            return res.status(404).json({ error: "User not found" });
        }
        const exisitingBookings = await Booking.findOne({status: {$in : ["pending", "upcoming"]}});
        if (exisitingBookings) {
            return res.status(400).json({error: "You can only make one booking at a time"});
        }
        if (!mongoose.Types.ObjectId.isValid(chefId)){
            return res.status(400).json({ error: "Invalid chef id"});
        }
        const chef = await User.findById(chefId);
        if (!chef){
            return res.status(404).json({ error: "Chef not found"});
        }
        if (!chef.role.includes('chef')){
            return res.status(400).json({ error: "Only a chef can accept booking"});
        }
        const prices = await Promise.all(
            packages.map(async (p) => {
                const pkg = await Package.findById(p.id);
                if (!pkg){
                    throw { status : 404, message: "Package not found"};
                }
                if (!pkg.chef.equals(chefId)){
                    throw {status: 400, message: "The selected package is not offered by this chef"};
                }
                return pkg.price;
            })
        );
        const totalPerPrice = prices.reduce((sum,a) => sum + a, 0);
        const cost = totalPerPrice * noOfPeople;
        const booking = new Booking({
            chef,
            customer,
            eventType,
            noOfPeople,
            date,
            timeInterval,
            packages,
            cost
        });

        await booking.save();
        const {chef: chefData, customer: customerData, ...bookingData} = booking.toObject();
        bookingData.chef = {_id: chefData._id, fullName: chefData.fullName};
        bookingData.customer = {_id: customerData._id, fullName: customerData.fullName};
        return res.status(200).json({ message: "Created booking scuccessfuly", bookingData});
    } 
    catch (e) {
        if (e instanceof mongoose.Error.ValidationError){
            console.error("Error creating booking: ", e.message)
            return res.status(400).json({ error: "Invalid data type"});
        } else if (e.status){
            return res.status(e.status).json({error: e.message});
        } 
        else {
            console.error("Error creating booking:", e);
            return res.status(500).json({ error: "Server error. Please try again later." });
        }
    }
};

const updateBookingStatus = async (req, res) => {
    try{
        const userId = req.userId;
        const {id: bookingId} = req.params;
        if (!req.body){
            return res.status(400).json({ error: "A body is required"});
        }
        const { status } = req.body;
        if (!status){
            return res.status(400).json({ error: "Insuffecient fields"});
        }
        if (!bookingStatusEnum.includes(status)){
            return res.status(400).json({error: "Invalid status value"});
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found"});
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(404).json({ error: "The authenticated user not found"});
        }
        if (booking.customer.equals(userId)){
            if (status != "cancelled"){
                return res.status(403).json({error: "The customer can only make or cancel the request"});
            }
            if (booking.status != "pending") {
                return res.status(400).json({error: "The booking is already accept. Contact an admin to cancel"});
            }
            booking.status = status;
            await booking.save();
            return res.status(200).json({message: "Updated booking status to " + status});

        }

        if ((!booking.chef.equals(userId)) && (!user.role.includes('admin'))){
            return res.status(403).json({error: "Only the chef can update booking status"});
        }
        switch(status){
            case "upcoming":
            case "cancelled":
                if (booking.status != "pending"){
                    return res.status(400).json({ error: "The booking is not in pending status"});
                }                
                break;
            case "completed":
                if (booking.status != "upcoming"){
                    return res.status(400).json({ error: "The booking is not in ongoing status"});
                }
                break;
            default:
                return res.status(400).json({error: "Can not set booking to pending. Create a new booking."});
        }
        booking.status = status;
        await booking.save();
        return res.status(200).json({message: "Updated booking status to " + status});

    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError){
            console.error("Error creating booking: ", e.message)
            return res.status(400).json({ error: "Invalid data type"});
        } else {
            console.error("Error updating booking:", e);
            return res.status(500).json({ error: "Server error. Please try again later." });
        }
    }
}

const getBookings = async (req, res) => {
    try {
        const userId = req.userId;
        var { userType } = req.query;
        if (!userType) userType = "customer";
        const user = await User.findById(userId);
        if (!rolesEnum.includes(userType)){
            return res.status(400).json({ error: "Invalid user role"});
        }
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        if (!user.role.includes(userType)) {
            return res.status(401).json({error: "Unauthorzied access. Your account is not registered for that role"});
        }
        var bookings;
        if (userType == "customer") {
            bookings = await Booking.find({customer: userId}).populate({path: 'chef', select: 'fullName _id phoneNumber'})
                    .populate({path: 'customer', select: 'fullName _id phoneNumber userAddress'});
        }
        else if (userType == "chef") {
            bookings = await Booking.find({chef: userId}).populate({path: 'chef', select: 'fullName _id phoneNumber'})
                    .populate({path: 'customer', select: 'fullName _id phoneNumber userAddress'});
        }
        else {
            bookings = { message: "No bookings for admin user"};
        }
        return res.status(200).json({bookings});
    } catch (e) {
        console.error("Error getting bookings", e);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}

const getRecentBooking = async (req, res) => {
    try{
        const userId = req.userId;
        const booking = await Booking.findOne({customer : userId}, {},{sort: {'createdAt' : -1}})
                .populate({path: 'chef', select: 'fullName _id phoneNumber urlToImage chef'})
                .populate({path: 'customer', select: 'fullName _id phoneNumber userAddress'})
                .populate({path: 'packages.id', select : 'name'});
        return res.status(200).json({booking});
    } catch (e) {
        console.error('Error getting recent booking', e);
        return res.status(500).json({error: "Server error. Please try agian later."});
    }
}

const rateBooking = async (req, res) => {
    try{
        const userId = req.userId;
        const {id} = req.params;
        const {rating, review} = req.body;
        
        if (!rating){
            return res.status(400).json({ error: "Insuffecient fields"});
        }
        const booking = await Booking.findById(id);
        if (!booking){
            return res.status(404).json({ error: "Booking not found"});
        }
        if (!booking.customer.equals(userId)){
            return res.status(403).json({ error: "Unauthorised access"});
        }
        if (booking.status != "completed"){
            return res.status(400).json({ error: "You can only rate completed bookings"});
        }
        if (rating > 5 || rating < 0){
            return res.status(400).json({ error: "Rating must be between 0 and 5"});
        }
        booking.rating = rating;
        if (review){
            booking.review = review;
        }
        await booking.save();
        return res.status(200).json({message : "Rating successfull"});
    } catch (e) {
        console.error('Error rating booking:', e);
        return res.status(500).json({error: "Server error. Please try again later."});
    }
}

module.exports = { createBooking, updateBookingStatus, getBookings, getRecentBooking, rateBooking };