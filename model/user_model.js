// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {type:String, required: true},
    lastName: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    phone: {type:String, required:true},
    address: {type:String, required:true},
    userType: {type:String, required:true, enum: ["customer", "admin"]}
}, {timestamps: true});

const userModel = mongoose.model("user", userSchema);

export default userModel;