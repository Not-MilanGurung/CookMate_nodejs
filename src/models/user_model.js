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
    userAddress : String,
    bio : {type: String, },
    role: {
      type: [String],
      enum: rolesEnum,
      default: ["customer"]
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
		chef: {
			speciality: {type: String},
      cuisines: {type: [String]},
			experience: {type: String, default: "0 years"},
      rating: {type: Number, default: 0.0},
      ratingCount : {type: Number, default: 0}
		},
    favoritePosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
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