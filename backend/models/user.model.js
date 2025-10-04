import mongoose from "mongoose";
import validator from "validator";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
     photo: {
        type: String,
        required: true,
    },
     education: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    }, 
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 5,
    }, 
    createdAt: {
        type:Date,
        default:Date.now,
    }
})


export const user = mongoose.model("User", userSchema);