"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    spaceSeeker: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceProvider: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    spaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Space', required: true },
}, { timestamps: true });
exports.Conversation = (0, mongoose_1.model)('Conversation', conversationSchema);
