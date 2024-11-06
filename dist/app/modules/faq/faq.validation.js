"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqValidation = void 0;
const zod_1 = require("zod");
const createFaqZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string().min(1),
        answer: zod_1.z.string().min(1),
    }),
});
const updateFaqZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string().min(1).optional(),
        answer: zod_1.z.string().min(1).optional(),
    }),
});
exports.FaqValidation = { createFaqZodSchema, updateFaqZodSchema };
