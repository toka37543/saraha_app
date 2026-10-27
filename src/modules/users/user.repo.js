import mongoose from "mongoose";
import {GENDERS} from "../../common/enums.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        trim: true //  remove extra spaces at the beginning and the end
    },
    first_name: String,
    last_name: String,
    email: String,
    email_confirmed: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        enum: Object.values(GENDERS), // ['MALE',"FEMALE"] // expects array,
    },
    age: Number,
    photo: String, // relative path, served under /uploads
    password: String,
}, {
    toJSON: {
        // never send the password hash back in a response
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
})

export const User = mongoose.model("User", userSchema);

