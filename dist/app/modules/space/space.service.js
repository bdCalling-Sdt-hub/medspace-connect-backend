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
exports.SpaceService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const space_model_1 = require("./space.model");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const user_1 = require("../../../enums/user");
const package_model_1 = require("../packages/package.model");
const space_1 = require("../../../enums/space");
const subscription_model_1 = require("../subscription/subscription.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const conversation_model_1 = require("../conversation/conversation.model");
const createSpaceToDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if provider exists
    const isExistProvider = yield user_model_1.User.findOne({
        _id: id,
        role: user_1.USER_ROLES.SPACEPROVIDER,
    });
    if (!isExistProvider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not a space provider!');
    }
    // Check subscription
    const isExistSubscription = yield subscription_model_1.Subscription.findById(isExistProvider.subscription);
    if (!isExistSubscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You have not bought any package yet!');
    }
    // Check package
    const isExistPackage = yield package_model_1.Package.findById(isExistSubscription.package);
    if (!isExistPackage) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Package not found!');
    }
    // Calculate current period dates
    const subscriptionDate = new Date(isExistSubscription.createdAt);
    const startDate = new Date(subscriptionDate);
    const endDate = new Date(subscriptionDate);
    endDate.setDate(subscriptionDate.getDate() + 30); // Add exactly 30 days
    // For debugging
    console.log({
        subscriptionStart: subscriptionDate.toISOString(),
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
    });
    // Find posts in current period
    const posts = yield space_model_1.Space.find({
        providerId: id,
        createdAt: { $gte: startDate, $lte: endDate },
    });
    // Check if post limit reached
    if (typeof isExistPackage.allowedSpaces === 'number') {
        if (posts.length >= isExistPackage.allowedSpaces) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `You have reached your post limit (${isExistPackage.allowedSpaces}) for this 30-day period! Your next period starts ${endDate.toDateString()}`);
        }
    }
    // Create space
    const result = yield space_model_1.Space.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create space!');
    }
    return result;
});
const updateSpaceToDB = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield space_model_1.Space.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Space not found!');
    }
    if (payload.spaceImages === null) {
        payload.spaceImages = isExist.spaceImages;
    }
    if (isExist.providerId.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not authorized!');
    }
    if (payload.status) {
        if (payload.status !== space_1.SPACE_STATUS.ACTIVE &&
            payload.status !== space_1.SPACE_STATUS.OCCUPIED) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid status!');
        }
    }
    const result = yield space_model_1.Space.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update space!');
    }
    return result;
});
const updateSpaceImagesToDB = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield space_model_1.Space.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Space not found!');
    }
    if (isExist.providerId.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not authorized!');
    }
    isExist.spaceImages.map((image) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, unlinkFile_1.default)(image);
    }));
    const result = yield space_model_1.Space.findByIdAndUpdate(id, { spaceImages: [...payload] }, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update space images!');
    }
    return result;
});
const addSpaceFacilitiesToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    if (typeof payload === 'string') {
        result = yield space_model_1.Space.findByIdAndUpdate(id, { $push: { facilities: payload } }, { new: true });
    }
    else if (Array.isArray(payload)) {
        result = yield space_model_1.Space.findByIdAndUpdate(id, { $push: { facilities: { $each: payload } } }, { new: true });
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'facilities must be an array of strings or just a string!');
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update space facilities!');
    }
    return result;
});
const removeSpaceFacilitiesToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    if (typeof payload === 'string') {
        result = yield space_model_1.Space.findByIdAndUpdate(id, { $pull: { facilities: payload } }, { new: true });
    }
    else if (Array.isArray(payload)) {
        result = yield space_model_1.Space.findByIdAndUpdate(id, { $pull: { facilities: { $in: payload } } }, { new: true });
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'facilities must be an array of strings or just a string!');
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to remove space facilities!');
    }
    return result;
});
const getSpaceByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield space_model_1.Space.findById(id).populate('providerId');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Space not found!');
    }
    return result;
});
const getAllSpacesFromDB = (paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const result = yield space_model_1.Space.find()
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('providerId');
    const total = yield space_model_1.Space.countDocuments();
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: result,
    };
});
const filterSpacesFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filterableFields = [
        'title',
        'price',
        'status',
        'priceType',
        'location',
        'openingDate',
        'practiceFor',
        'facilities',
        'description',
    ];
    const filter = {};
    Object.keys(query).forEach(key => {
        if (filterableFields.includes(key)) {
            if (key === 'facilities') {
                filter[key] = { $in: query[key].split(',') };
            }
            else if (key === 'title' ||
                key === 'description' ||
                key === 'location') {
                filter[key] = { $regex: query[key], $options: 'i' };
            }
            else {
                filter[key] = query[key];
            }
        }
    });
    if (query.priceRange) {
        const [min, max] = query.priceRange.split('-');
        filter.price = { $gte: parseFloat(min), $lte: parseFloat(max) };
    }
    const result = yield space_model_1.Space.find(filter, { status: space_1.SPACE_STATUS.ACTIVE });
    if (!result.length) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No spaces found matching the criteria');
    }
    return result;
});
const getProvidersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find({ role: user_1.USER_ROLES.SPACEPROVIDER }).select('-password -refreshToken -createdAt -updatedAt -role -authorization -verified');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Providers not found!');
    }
    return result;
});
const getSpaceStatusFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalProvider = yield user_model_1.User.find({
        role: user_1.USER_ROLES.SPACEPROVIDER,
    }).countDocuments();
    const totalSeeker = yield user_model_1.User.find({
        role: user_1.USER_ROLES.SPACESEEKER,
    }).countDocuments();
    const totalConversation = yield conversation_model_1.Conversation.find({}).countDocuments();
    const finalResult = {
        totalProvider,
        totalSeeker,
        totalDeals: totalConversation,
    };
    return finalResult;
});
const getMySpacesFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistProvider = yield user_model_1.User.findById(userId);
    if (!isExistProvider) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User not found!');
    }
    const result = yield space_model_1.Space.find({ providerId: isExistProvider._id }).populate('providerId');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Spaces not found!');
    }
    return result;
});
const getRecentSpacesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield space_model_1.Space.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('providerId');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Spaces not found!');
    }
    return result;
});
exports.SpaceService = {
    createSpaceToDB,
    getSpaceStatusFromDB,
    updateSpaceToDB,
    updateSpaceImagesToDB,
    addSpaceFacilitiesToDB,
    filterSpacesFromDB,
    removeSpaceFacilitiesToDB,
    getMySpacesFromDB,
    getSpaceByIdFromDB,
    getAllSpacesFromDB,
    getProvidersFromDB,
    getRecentSpacesFromDB,
};
