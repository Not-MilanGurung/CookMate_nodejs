const mongoose = require('mongoose');
const schema = mongoose.Schema;

const packageSchema = new schema(
    {
        chef: {type: schema.Types.ObjectId, ref: 'User'},
        name: {type: String, required: true},
        price: {type: Number, required: true},
        isActive: {type: Boolean, default: true},
        description: {type: String, required: true},
        dishes: [String]
    },
    {
        timestamp: true
    }
);

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;