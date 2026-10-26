import mongoose from "mongoose";

const fruitSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    price: Number,
    quantity: Number,
})

export const Fruit = mongoose.model("Fruit",fruitSchema);

