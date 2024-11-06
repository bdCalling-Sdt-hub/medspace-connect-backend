"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionValidation = exports.SubscriptionValidationZodSchema = void 0;
const zod_1 = require("zod");
// Define your validation schema here
exports.SubscriptionValidationZodSchema = zod_1.z.object({
// Define your schema fields here
});
exports.SubscriptionValidation = { SubscriptionValidationZodSchema: exports.SubscriptionValidationZodSchema };
