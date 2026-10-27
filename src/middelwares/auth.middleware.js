import {errorResponse,decodeToken} from '../common/helpers.js'
import config from '../config.js'
import {User} from "../modules/users/user.repo.js"


export const authenticate = (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization) {
        throw new Error("authorization required is missing")
    }
    const decodedToken = decodeToken(authorization,config.jwtSecret)
    const user = await User.findById(decodedToken.id);
    if (!user) {
        throw new Error("user does not exist")
    }

    req.authUser = user;
    next();
}