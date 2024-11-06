"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberValidation = void 0;
const zod_1 = require("zod");
const createSubscriberZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
exports.SubscriberValidation = {
    createSubscriberZodSchema,
};
