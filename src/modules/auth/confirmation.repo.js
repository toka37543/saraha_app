import mongoose from "mongoose";

const emailConfirmationSchema = new mongoose.Schema({
    token:{
        type: String,
        required: true,
        trim: true
    },
    user_id:{
        type : String,
        required:true
    },
    requested_at: {
        type: Date,
        required: true
    },
    valid_until: {
        type: Date,
        required: true
    },
    used:{
        type:Boolean,
        default: false
    }
})
export const EmailConfirmation = mongoose.model("EmailConfirmation", emailConfirmationSchema);
