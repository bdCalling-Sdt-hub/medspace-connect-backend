"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationValidation = void 0;
const zod_1 = require("zod");
const sendNotificationToReceiverZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        receiverId: zod_1.z.string().optional(),
        type: zod_1.z.enum(['message', 'normal']).optional(),
        data: zod_1.z.object({}).optional(),
    }),
});
exports.NotificationValidation = {
    sendNotificationToReceiverZodSchema,
};
