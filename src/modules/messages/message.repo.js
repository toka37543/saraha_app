import mongoose from "mongoose";


const messageSchema=new mongoose.Schema({
    message:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
        trim: true
    },
    sender_id: String,
    receiver_username: String,
})

export const Message=mongoose.model("Message",messageSchema);