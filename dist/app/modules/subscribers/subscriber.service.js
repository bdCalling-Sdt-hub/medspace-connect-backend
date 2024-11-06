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
exports.SubscriberService = void 0;
const subscriber_model_1 = require("./subscriber.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createSubscriber = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriber_model_1.Subscriber.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create subscriber!');
    }
    return result;
});
const getAllSubscribers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriber_model_1.Subscriber.find();
    return result;
});
const getSubscriberById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriber_model_1.Subscriber.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Subscriber not found!');
    }
    return result;
});
const getSubscriberByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriber_model_1.Subscriber.findOne({ email });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Subscriber not found!');
    }
    return result;
});
const deleteSubscriber = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriber_model_1.Subscriber.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Subscriber not found!');
    }
    return result;
});
const sendEmailToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // emailHelper.sendEmail
    // return result;
});
exports.SubscriberService = {
    createSubscriber,
    getAllSubscribers,
    sendEmailToDB,
    getSubscriberById,
    getSubscriberByEmail,
    deleteSubscriber,
};
