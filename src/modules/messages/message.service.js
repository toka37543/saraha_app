import {Message} from "./message.repo.js";
import {User} from "../users/user.repo.js";
import {BadRequestException, NotFoundException} from "../../common/errors.js";

export const MessageService = {
    create: async (data) => {
        const {
            message,
            sender_id,
            receiver_username
        } = data;

        // Checking for required fields
        if (!message || !sender_id || !receiver_username) {
            throw new BadRequestException("Some fields are required");
        }

        const checkSender = await User.findById(sender_id);

        if (!checkSender) {
            throw new NotFoundException("Sender not found");
        }

        const checkReceiver = await User.findOne({
            username: receiver_username
        })

        if (!checkReceiver) {
            throw new NotFoundException("Receiver not found");
        }

        if (checkSender.id === checkReceiver.id) {
            throw new BadRequestException("must be a different receiver");
        }

        return await Message.create({
            message,
            sender_id,
            receiver_username
        })
    }
}
