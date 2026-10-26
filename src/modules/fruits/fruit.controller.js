import {Fruit} from "./fruit.repo.js";

export const FruitController = {
    getAll: async (req, res) => {
        const fruits = await Fruit.find();
        return res.json(fruits);
    },
    create: async (req, res) => {
        const fruit = await Fruit.create(req.body);
        return res.json(fruit);
    },
    update: async (req, res) => {
        const id = req.params.id;
        const fruit = await Fruit.updateOne({_id:id} ,req.body)
        return res.json(fruit);
    },
    delete: async (req, res) => {
        const id = req.params.id;
        const fruit = await Fruit.deleteOne({quantity:300})
        return res.json(fruit);
    },
    getById: async (req, res) => {
        const fruits = await Fruit.findById(req.params.id)
        return res.json(fruits);
    }
}