import {UserService} from "./user.service.js"
export const UserController = {
    profile: async (req, res) => {
        // const {authorization} = req.headers;
        // const result = await UserService.findByToken(authorization);
        return res.status(200).json({
            user: req.authUser
        })
    }
}
