import {MessageService} from "./message.service.js";
import {successResponse} from "../../common/helpers.js";

export const MessageController = {
    create: async (req, res) => {
        const body = req.body || {};
        const send = await MessageService.create(body);
        return res.status(201).json(successResponse("Message Sent Successfully", send));
    }
}
