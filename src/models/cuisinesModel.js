const mongoose = require('mongoose');

const cuisines = new mongoose.Schema(
    {
        name :{type: String, required: true, unique: true},
    },
    {   
        timestamps: true    
    }
);


const Cuisine = mongoose.model('Cuisine', cuisines);

module.exports = Cuisine;