import {MessageService} from "./message.service.js";
import {Message} from "./message.repo.js";

export const MessageController = {
    create: async (req, res) => {
        const body = req.body || {};
        const send = await MessageService.create(body);
        return res.status(201).json(send);
    }
}