"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutValidation = exports.updateAboutZodSchema = exports.createAboutZodSchema = void 0;
const zod_1 = require("zod");
// Define your validation schema here
exports.createAboutZodSchema = zod_1.z.object({
    title: zod_1.z.string({ required_error: 'Title is required' }),
    description: zod_1.z.string({ required_error: 'Description is required' }),
    image: zod_1.z.string().optional(),
});
exports.updateAboutZodSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.AboutValidation = { createAboutZodSchema: exports.createAboutZodSchema, updateAboutZodSchema: exports.updateAboutZodSchema };
