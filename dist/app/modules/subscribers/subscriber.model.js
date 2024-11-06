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
exports.Subscriber = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const subscriberSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, { timestamps: true });
subscriberSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const isExistSubscriber = yield exports.Subscriber.findOne({
            email: this.email,
        });
        if (isExistSubscriber) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Subscriber already exists!');
        }
        const isExistUser = yield user_model_1.User.findOne({
            email: this.email,
        });
        if (isExistUser) {
            this.user = isExistUser._id;
        }
        next();
    });
});
exports.Subscriber = (0, mongoose_1.model)('Subscriber', subscriberSchema);
