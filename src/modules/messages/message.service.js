import {Message} from "./message.repo.js";
import {User} from "../users/user.repo.js";

export const MessageService = {
    create: async (data) => {
        const {
            message,
            sender_id,
            receiver_username
        } = data;

        // Checking for required fields
        if (!message || !sender_id || !receiver_username) {
            throw new Error("Some fields are required");
        }

        const checkSender = await User.findById(sender_id);

        if (!checkSender) {
            throw new Error("Sender does not found ");
        }

        const checkReceiver = await User.findOne({
            username: receiver_username
        })

        if (checkSender.email === checkReceiver. email) {
            throw new Error("must be a different receiver");
        }

        return await Message.create(data)
    }
}