import {validateEmail, validateUsername, hashPassword} from "../../common/helpers.js";
import {BadRequestException, ConflictException} from "../../common/errors.js";
import {USERS_UPLOAD_DIR} from "../../middelwares/upload.js";
import {User} from "./user.repo.js";
import {GENDERS} from "../../common/enums.js"
import fs from "node:fs/promises";
import path from "node:path";

export const UserService = {
    create: async (data) => {
        const {
            first_name,
            last_name,
            email,
            username,
            password,
            gender,
            age
        } = data;

        // Checking for required fields
        if (!first_name || !last_name || !email || !username || !password || !gender) {
            throw new BadRequestException("Some fields are required");
        }

        // check if email is valid email
        if (!validateEmail(email)) {
            throw new BadRequestException("Email is invalid");
        }

        if (!validateUsername(username)) {
            throw new BadRequestException("Username is invalid");
        }

        if (!Object.values(GENDERS).includes(gender)) {
            throw new BadRequestException("Gender is invalid");
        }

        const checkIsExists = await User.findOne({
            $or: [
                {email: email},
                {username: username}
            ]
        });

        if (checkIsExists) {
            throw new ConflictException("Email or username already exists");
        }

        data.password = await hashPassword(password);

        return await User.create(data);
    },
    updatePhoto: async (user, file) => {
        const oldPhoto = user.photo;

        user.photo = `${USERS_UPLOAD_DIR}/${file.filename}`;
        await user.save();

        // remove the previous photo from disk after the new one is saved
        if (oldPhoto) {
            await fs.rm(path.join(USERS_UPLOAD_DIR, path.basename(oldPhoto)), {force: true});
        }

        return user;
    }
}

