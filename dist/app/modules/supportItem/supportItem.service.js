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
exports.SupportItemService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const supportItem_model_1 = require("./supportItem.model");
const createSupportItemServiceFunction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const result = yield supportItem_model_1.SupportItem.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create support item');
    }
    return result;
});
const getAllSupportItemServiceFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_model_1.SupportItem.find();
    return result;
});
const getSupportItemByIdServiceFunction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_model_1.SupportItem.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Support item not found');
    }
    return result;
});
const updateSupportItemByIdServiceFunction = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield supportItem_model_1.SupportItem.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Support item not found');
    }
    const result = yield supportItem_model_1.SupportItem.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Support item not found');
    }
    return result;
});
const deleteSupportItemByIdServiceFunction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield supportItem_model_1.SupportItem.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Support item not found');
    }
    const result = yield supportItem_model_1.SupportItem.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Support item not found');
    }
    return result;
});
exports.SupportItemService = {
    createSupportItemServiceFunction,
    getAllSupportItemServiceFunction,
    getSupportItemByIdServiceFunction,
    updateSupportItemByIdServiceFunction,
    deleteSupportItemByIdServiceFunction,
};
