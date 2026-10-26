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