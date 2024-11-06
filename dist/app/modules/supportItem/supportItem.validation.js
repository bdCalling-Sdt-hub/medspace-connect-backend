"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportItemValidation = void 0;
const zod_1 = require("zod");
// Define your validation schema here
const createSupportItemZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        type: zod_1.z.string({ required_error: 'Type is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
    }),
});
const updateSupportItemZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        type: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(1).optional(),
    }),
});
exports.SupportItemValidation = {
    createSupportItemZodSchema,
    updateSupportItemZodSchema,
};
