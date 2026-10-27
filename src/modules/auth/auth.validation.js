import {email, z} from "zod";
import {GENDERS} from "../../common/enums.js"
export const loginSchema= z.strictObject({
    email: z.email(),
    password: z.string().min(6).max(16)
}).catchall(z.boolean())

export const registerSchema= loginSchema.extend({
    first_name :z.string().min(6).max(16),
    last_name :z.string().min(6).max(16),
    username :z.string().min(6).max(16),
    gender:z.enum(GENDERS).default(GENDERS.male),
    age:z.number().min(16).max(60).optional()
})

// forget password and resend confirmation
export const emailSchema = z.strictObject({
    email: z.email(),
})

// token must be a string, otherwise {"$ne": null} would be passed to mongo as a query operator
export const confirmEmailSchema = emailSchema.extend({
    token: z.string().length(64),
})

export const resetPasswordSchema = confirmEmailSchema.extend({
    password: z.string().min(6).max(16)
})
