"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../user/user.model");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const space_model_1 = require("../../space/space.model");
const conversation_model_1 = require("../conversation.model");
const messageSchema = new mongoose_1.Schema({
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    spaceID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Space',
    },
    conversationID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        required: false,
        enum: ['unread', 'read'],
        default: 'unread',
    },
    date: {
        type: String,
        required: true,
    },
}, { timestamps: true });
messageSchema.index({ message: 'text' });
messageSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const isExistFrom = yield user_model_1.User.findById(this.from);
        if (!isExistFrom) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'From user not found!');
        }
        const isExistTo = yield user_model_1.User.findById(this.to);
        if (!isExistTo) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'To user not found!');
        }
        const isExistSpace = yield space_model_1.Space.findOne({
            _id: this.spaceID,
        });
        if (!isExistSpace) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Space not found!');
        }
        const isExistConversation = yield conversation_model_1.Conversation.findOne({
            _id: this.conversationID,
        });
        if (!isExistConversation) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Conversation not found!');
        }
        next();
    });
});
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
