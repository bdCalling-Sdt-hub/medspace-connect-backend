"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceValidation = void 0;
const zod_1 = require("zod");
const space_1 = require("../../../enums/space");
const createSpaceZodSchema = zod_1.z.object({
    title: zod_1.z.string({ required_error: 'title is required' }),
    price: zod_1.z.number({ required_error: 'price is required' }),
    priceType: zod_1.z.string({ required_error: 'priceType is required' }),
    location: zod_1.z.string({ required_error: 'location is required' }),
    openingDate: zod_1.z.string({ required_error: 'openingDate is required' }),
    practiceFor: zod_1.z.string({ required_error: 'practiceFor is required' }),
    facilities: zod_1.z.array(zod_1.z.string({ required_error: 'facilities is required' })),
    description: zod_1.z.string({ required_error: 'description is required' }),
});
const updateSpaceZodSchema = zod_1.z.object({
    title: zod_1.z.string({ invalid_type_error: 'title must be a string' }).optional(),
    price: zod_1.z.number({ invalid_type_error: 'price must be a number' }).optional(),
    priceType: zod_1.z
        .string({ invalid_type_error: 'priceType must be a string' })
        .optional(),
    location: zod_1.z
        .string({ invalid_type_error: 'location must be a string' })
        .optional(),
    speciality: zod_1.z
        .string({ invalid_type_error: 'speciality must be a string' })
        .optional(),
    openingDate: zod_1.z
        .string({ invalid_type_error: 'openingDate must be a string' })
        .optional(),
    practiceFor: zod_1.z
        .string({ invalid_type_error: 'practiceFor must be a string' })
        .optional(),
    description: zod_1.z
        .string({ invalid_type_error: 'description must be a string' })
        .optional(),
    status: zod_1.z
        .enum([space_1.SPACE_STATUS.ACTIVE, space_1.SPACE_STATUS.OCCUPIED], {
        invalid_type_error: 'status must be ACTIVE or OCCUPIED',
    })
        .optional(),
});
exports.SpaceValidation = {
    createSpaceZodSchema,
    updateSpaceZodSchema,
};
