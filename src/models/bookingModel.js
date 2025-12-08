const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingStatusEnum = ["pending", "upcoming", "cancelled", "completed"];

const bookingSchema = new Schema({
    chef: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    customer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    eventType : {type: String, required: true},
    noOfPeople : {type: Schema.Types.Int32, required: true},
    date: {type: Date, required: true},
    timeInterval: {type: String, required: true},
    packages: [Schema.Types.Mixed],
    cost: {type: Schema.Types.Int32, required: true},
    status: {type: String, default: "pending", enum : bookingStatusEnum},
    rating: {type: Number, min: 0, max: 5}
},{
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = {Booking, bookingStatusEnum};