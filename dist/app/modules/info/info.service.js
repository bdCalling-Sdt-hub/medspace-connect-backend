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
exports.InfoService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const info_model_1 = require("./info.model");
const createInfoToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create info');
    }
    return result;
});
const updateInfoToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update info');
    }
    return result;
});
const deleteInfoToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete info');
    }
    return result;
});
const getAllInfoFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.find();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to get all info');
    }
    return result;
});
const getSingleInfoFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to get single info');
    }
    return result;
});
const getInfoByNameFromDB = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield info_model_1.Info.findOne({ name });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to get info by name');
    }
    return result;
});
exports.InfoService = {
    createInfoToDB,
    updateInfoToDB,
    deleteInfoToDB,
    getAllInfoFromDB,
    getSingleInfoFromDB,
    getInfoByNameFromDB,
};
