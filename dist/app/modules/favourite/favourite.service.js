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
exports.FavouriteService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const favourite_model_1 = require("./favourite.model");
const createFavourite = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield favourite_model_1.Favourite.findOne({
        spaceId: payload.spaceId,
        userId: payload.userId,
    });
    if (isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Favourite already exists');
    }
    const result = yield favourite_model_1.Favourite.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create favourite');
    }
    return result;
});
const getAllFavourites = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favourite_model_1.Favourite.find();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Favourites not found');
    }
    return result;
});
const getFavouriteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favourite_model_1.Favourite.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Favourite not found');
    }
    return result;
});
const updateFavourite = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favourite_model_1.Favourite.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update favourite');
    }
    return result;
});
const deleteFavouriteToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    const result = yield favourite_model_1.Favourite.findOneAndDelete({ spaceId: id });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete favourite');
    }
    return result;
});
const getFavouriteByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favourite_model_1.Favourite.find({ userId }).populate({
        path: 'spaceId',
        populate: { path: 'providerId' },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Favourites not found');
    }
    return result;
});
exports.FavouriteService = {
    createFavourite,
    getAllFavourites,
    getFavouriteById,
    updateFavourite,
    deleteFavouriteToDB,
    getFavouriteByUserId,
};
