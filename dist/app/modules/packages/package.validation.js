"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageValidation = void 0;
const zod_1 = require("zod");
const createPackageZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }).min(1),
        price: zod_1.z.number({ required_error: 'Price is required' }).min(1),
        features: zod_1.z
            .array(zod_1.z.string({ required_error: 'Features are required' }), {
            required_error: 'Features are required',
        })
            .min(1),
        allowedSpaces: zod_1.z
            .number({ required_error: 'Allowed spaces are required' })
            .min(1),
    }),
});
const updatePackageZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        allowedSpaces: zod_1.z.number().optional(),
    }),
});
exports.PackageValidation = {
    createPackageZodSchema,
    updatePackageZodSchema,
};
