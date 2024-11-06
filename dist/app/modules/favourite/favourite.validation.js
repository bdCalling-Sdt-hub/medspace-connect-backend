"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouriteValidation = void 0;
const zod_1 = require("zod");
const createFavouriteZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        spaceId: zod_1.z.string().optional(),
    }),
});
exports.FavouriteValidation = { createFavouriteZodSchema };
