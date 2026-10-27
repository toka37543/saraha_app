import {UserService} from "./user.service.js"
import {successResponse} from "../../common/helpers.js"
import {BadRequestException} from "../../common/errors.js"
export const UserController = {
    // req.user is set by the authenticate middleware
    profile: async (req, res) => {
        return res.status(200).json(successResponse("User Profile", req.user))
    },
    // req.file is set by the uploadPhoto (multer) middleware
    uploadPhoto: async (req, res) => {
        if (!req.file) {
            throw new BadRequestException("Photo is required", null, "MISSING_FILE");
        }
        const user = await UserService.updatePhoto(req.user, req.file);
        return res.status(200).json(successResponse("Photo Uploaded Successfully", user))
    }
}
