"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportItem = void 0;
const mongoose_1 = require("mongoose");
const supportItemSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});
exports.SupportItem = (0, mongoose_1.model)('supportItem', supportItemSchema);
