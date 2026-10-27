import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
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
        required: true
    }
})
export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);