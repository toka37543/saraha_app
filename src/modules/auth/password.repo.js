import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    token:{
        type: String,
        require: true,
        trim: true
    },
    user_id:{
        type : String,
        require:true
    },
    requested_at: {
        type: Date,
        require: true
    },
    valid_until: {
        type: Date,
        require: true
    },
    used:{
        type:Boolean,
        require: true
    }
})
export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);