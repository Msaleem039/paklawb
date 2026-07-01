import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    mobileNo:{type:String, required:true, unique:true},
    email:{type:String, required:true, unique:true},
    pin:{type:String, required:true},
    address:{type:String, required:true},
    city:{type:String, required:true},
    role:{type:String, enum:['admin','user'], default:'user'},
    cartData:{type:Object, default:{}}
},{minimize:false})

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;