"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoValidation = void 0;
const zod_1 = require("zod");
const createInfoZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        content: zod_1.z.string({ required_error: 'Content is required' }),
    }),
});
const updateInfoZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
    }),
});
exports.InfoValidation = { createInfoZodSchema, updateInfoZodSchema };
