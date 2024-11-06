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
exports.Space = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const space_1 = require("../../../enums/space");
const spaceSchema = new mongoose_1.Schema({
    spaceImages: {
        type: [String],
        required: [true, 'Space images are required'],
    },
    providerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Provider is required'],
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    priceType: {
        type: String,
        enum: ['Monthly', 'Yearly'],
        required: [true, 'Price type is required'],
    },
    status: {
        type: String,
        enum: space_1.SPACE_STATUS,
        default: space_1.SPACE_STATUS.ACTIVE,
        required: false,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
    openingDate: {
        type: String,
        required: [true, 'Opening date is required'],
    },
    practiceFor: {
        type: String,
        required: [true, 'Practice for is required'],
    },
    facilities: {
        type: [String],
        required: [true, 'Facilities are required'],
    },
    speciality: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
}, { timestamps: true });
spaceSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const isExistProvider = yield user_model_1.User.findOne({
            _id: this.providerId,
            role: user_1.USER_ROLES.SPACEPROVIDER,
        });
        if (!isExistProvider) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Provider not found!');
        }
        next();
    });
});
exports.Space = (0, mongoose_1.model)('Space', spaceSchema);
