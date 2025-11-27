const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const rolesEnum = ["customer", "chef", "admin"];

const userSchema = new mongoose.Schema(
    {
        fullName:{type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        signInMethod : {type: String, required: true},
        phoneNumber : {type: String, required: true},
        urlToImage : String,
        geoPoint : {type: mongoose.Schema.Types.Mixed},
        userAddress : String,
        role: {
			type: [String],
			enum: rolesEnum,
			default: ["customer"]
        },
		chef: {
			speciality: {type: mongoose.Schema.Types.ObjectId, ref: 'Cuisine'},
			experience: String
		},
    },
    {   
        timestamps: true    
    }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = {User, rolesEnum};