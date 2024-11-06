"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enums/user");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        contact: zod_1.z.string({ required_error: 'Contact is required' }),
        role: zod_1.z.enum([user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER], {
            required_error: 'Role is required',
        }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        // location: z.string({ required_error: 'Location is required' }),
        profile: zod_1.z.string().optional(),
    }),
});
const deviceTokenZodSchema = zod_1.z.object({
    token: zod_1.z.string(),
    action: zod_1.z.enum(['add', 'remove']),
});
exports.UserValidation = {
    createUserZodSchema,
    deviceTokenZodSchema,
};
