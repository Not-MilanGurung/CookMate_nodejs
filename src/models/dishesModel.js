const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: {type: String, required: true},
    chef: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    cuisine: {type: mongoose.Schema.Types.ObjectId, ref: 'Cuisine'},
    urlToImage: {type: String}
});

const Dish = mongoose.model('Dish', DishSchema);

module.exports = Dish;
