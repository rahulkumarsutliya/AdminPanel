const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String},
    email : { type : String, required : true, unique: true},
    password : { type : String, required : true},
    otp : { type : String },
    otpExpires : { type: Date},
    isVerified : { type : Boolean, default : false},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"},
});


module.exports  = mongoose.model('User',userSchema);
