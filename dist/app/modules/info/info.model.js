"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Info = void 0;
const mongoose_1 = require("mongoose");
const infoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.Info = (0, mongoose_1.model)('Info', infoSchema);
