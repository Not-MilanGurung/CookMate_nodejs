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
    rating: {type: Number, min: 0, max: 5},
    review: {type: String}
},{
    timestamps: true
});

async function recalcChefRating(chefId, model) {
  const result = await model.aggregate([
    { 
      $match: { 
        chef: chefId, 
        status: "completed", 
        rating: { $ne: null } 
      }
    },
    {
      $group: {
        _id: "$chef",
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);
  if (result.length === 0) return;

  const user = await mongoose.model("User").findByIdAndUpdate(chefId, {
    $set: {
      "chef.rating": Number(result[0].averageRating.toFixed(1)),
      "chef.ratingCount": result[0].count
    }
  });
}

bookingSchema.post("save", async function(doc) {
  if (doc.status !== "completed" || doc.rating == null) return;
  await recalcChefRating(doc.chef, this.constructor);
});

bookingSchema.post("findOneAndUpdate", async function(result) {
  if (!result) return;
  if (result.status !== "completed" || result.rating == null) return;
  await recalcChefRating(result.chef, this.model);
});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = {Booking, bookingStatusEnum};