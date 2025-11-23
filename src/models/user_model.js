const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName:{type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        signInMethod : {type: String, required: true},
        phoneNumber : {type: String, required: true},
        geoPoint : {type: mongoose.Schema.Types.Mixed},
        role: {type: String, default: "customer"}
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

module.exports = User;