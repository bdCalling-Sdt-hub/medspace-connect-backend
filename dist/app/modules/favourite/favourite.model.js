"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favourite = void 0;
const mongoose_1 = require("mongoose");
const favouriteSchema = new mongoose_1.Schema({
    spaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Space', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
}, { timestamps: true });
exports.Favourite = (0, mongoose_1.model)('favourite', favouriteSchema);
