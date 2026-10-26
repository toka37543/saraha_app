import {validateEmail, validateUsername, hashPassword, decodeToken} from "../../common/helpers.js";
import {User} from "./user.repo.js";
import {GENDERS} from "../../common/enums.js"

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
            throw new Error("Some fields are required");
        }

        // check if email is valid email
        if (!validateEmail(email)) {
            throw new Error("Email is invalid");
        }

        if (!validateUsername(username)) {
            throw new Error("Username is invalid");
        }

        if (!Object.values(GENDERS).includes(gender)) {
            throw new Error("Gender is invalid");
        }

        const checkIsExists = await User.findOne({
            $or: [
                {email: email},
                {username: username}
            ]
        });

        if (checkIsExists) {
            throw new Error("Email or username already exists");
        }

        data.password = await hashPassword(password);

        return await User.create(data);
    },
    findByToken: async (token) => {
        // decode token
        const decoded = decodeToken(token);
        // get user by id
        const res = await User.findById(decoded.id)
        return res;
    }
}
