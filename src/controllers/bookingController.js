const Booking = require('../models/bookingModel');
const {User , rolesEnum} = require('../models/user_model');
const mongoose = require('mongoose');

const createBooking = async (req, res) => {
    try{
        const userId = req.userId;
        const { chefId, eventType, date, timeInterval, noOfPeople, packages } = req.body;

        if (!chefId || !eventType || !date || !timeInterval || !noOfPeople || !packages ){
            return res.status(400).json({ error: "All fields are required"});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const chef = await User.findById(chefId);
        if (!chef){
            return res.status(404).json({ error: "Chef not found"});
        }
        if (!chef.role.chef){
            return res.status(400).json({ error: "Only a chef can accept booking"});
        }
        const cost = 100;
        const booking = new Booking({
            chef,
            user,
            date,
            timeInterval,
            eventType,
            noOfPeople,
            packages,
            cost
        });

        await booking.save();
        return res.status(200).json({ message: "Created booking scuccessfuly", booking});
    } 
    catch (e) {
        if (e instanceof mongoose.Error.ValidationError){
            console.error("Error creating booking: ", e.message)
            return res.status(400).json({ error: "Invalid data type"});
        } else {
            console.error("Error creating booking:", e);
            return res.status(500).json({ error: "Server error. Please try again later." });
        }
    }
};

const updateBookingStatus = async (req, res) => {
    try{
        const userId = req.userId;

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

const getBooking = async (req, res) => {
    try {
        const userId = req.userId;
        const { userType } = req.params;
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
        if (userType == "customer") {
            const bookings = await Booking.find({customer: userId});
            return res.status(200).json({bookings});
        }
    } catch (e) {
        console.error("Error getting bookings");
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
}

module.exports = { createBooking, updateBookingStatus, getBooking };