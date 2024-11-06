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
exports.AboutService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const about_model_1 = require("./about.model");
const about_validation_1 = require("./about.validation");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const createAboutToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield about_validation_1.AboutValidation.createAboutZodSchema.parseAsync(payload);
    const result = yield about_model_1.About.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create about');
    }
    return result;
});
const getAllAboutFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.find();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    return result;
});
const getSingleAboutFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    return result;
});
const updateAboutToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield about_validation_1.AboutValidation.updateAboutZodSchema.parseAsync(payload);
    const about = yield about_model_1.About.findById(id);
    if (!about) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    if (about.image) {
        yield (0, unlinkFile_1.default)(about === null || about === void 0 ? void 0 : about.image);
    }
    const result = yield about_model_1.About.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    return result;
});
const deleteAboutFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const about = yield about_model_1.About.findById(id);
    if (!about) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    if (about.image) {
        yield (0, unlinkFile_1.default)(about === null || about === void 0 ? void 0 : about.image);
    }
    const result = yield about_model_1.About.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'About not found');
    }
    return result;
});
exports.AboutService = {
    createAboutToDB,
    getAllAboutFromDB,
    getSingleAboutFromDB,
    updateAboutToDB,
    deleteAboutFromDB,
};
