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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const searchAndFilterSpaces = (filterOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = filterOptions, otherFilters = __rest(filterOptions, ["search"]);
        let baseQuery = { status: space_1.SPACE_STATUS.ACTIVE };
        // Handle search term if provided
        if (search) {
            const searchWords = search.trim().toLowerCase().split(/\s+/);
            baseQuery.$or = searchWords.map((word) => ({
                $or: [
                    { title: { $regex: word, $options: 'i' } },
                    { description: { $regex: word, $options: 'i' } },
                    { facilities: { $regex: word, $options: 'i' } },
                ],
            }));
        }
        // Handle other filters
        const filterableFields = [
            'price',
            'priceType',
            'location',
            'openingDate',
            'practiceFor',
        ];
        Object.keys(otherFilters).forEach(key => {
            if (filterableFields.includes(key)) {
                if (key === 'location') {
                    baseQuery[key] = { $regex: otherFilters[key], $options: 'i' };
                }
                else {
                    baseQuery[key] = otherFilters[key];
                }
            }
        });
        // Handle facilities filter
        if (otherFilters.facilities) {
            baseQuery.facilities = {
                $in: otherFilters.facilities
                    .split(',')
                    .map((f) => new RegExp(f.trim(), 'i')),
            };
        }
        // Handle price range
        if (otherFilters.priceRange) {
            const [min, max] = otherFilters.priceRange.split('-');
            baseQuery.price = {
                $gte: parseFloat(min),
                $lte: parseFloat(max),
            };
        }
        // Fetch spaces with all filters applied
        const spaces = yield space_model_1.Space.find(baseQuery).populate('providerId').lean();
        if (search) {
            // Calculate match scores only if there's a search term
            const searchWords = search.trim().toLowerCase().split(/\s+/);
            const rankedSpaces = spaces.map(space => {
                let matchScore = 0;
                const spaceText = `${space.title} ${space.description} ${space.facilities.join(' ')}`.toLowerCase();
                searchWords.forEach((word) => {
                    if (spaceText.includes(word.toLowerCase())) {
                        matchScore++;
                    }
                });
                return Object.assign(Object.assign({}, space), { matchScore });
            });
            // Sort by match score first, then by date
            const sortedSpaces = rankedSpaces.sort((a, b) => {
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                return (
                //@ts-ignore
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
            return sortedSpaces.map((_a) => {
                var { matchScore } = _a, space = __rest(_a, ["matchScore"]);
                return space;
            });
        }
        // If no search term, just return filtered spaces sorted by date
        return spaces.sort((a, b) => 
        //@ts-ignore
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    catch (error) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Error searching and filtering spaces');
    }
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
const getInterestedSpacesFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findById(userId);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User not found!');
    }
    const interestedSpaces = yield conversation_model_1.Conversation.find({
        spaceSeeker: isExistUser._id,
    }).populate({
        path: 'spaceId',
        populate: { path: 'providerId' },
    });
    if (!interestedSpaces) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Spaces not found!');
    }
    const finalResult = interestedSpaces.map((item) => {
        const conversationStarted = new Date(item.createdAt);
        const todaysDate = new Date();
        const totalDays = Math.floor((todaysDate.getTime() - conversationStarted.getTime()) /
            (1000 * 60 * 60 * 24));
        // Calculate months and remaining days
        const months = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;
        // Create appropriate string based on months and days
        let activeSince = '';
        if (months > 0 && remainingDays > 0) {
            activeSince = `${months} month${months > 1 ? 's' : ''} and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
        else if (months > 0) {
            activeSince = `${months} month${months > 1 ? 's' : ''}`;
        }
        else {
            activeSince = `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
        const finalData = Object.assign(Object.assign({}, item.spaceId._doc), { activeSince, interestedSince: conversationStarted.toDateString() });
        return finalData;
    });
    return finalResult;
});
exports.SpaceService = {
    createSpaceToDB,
    getSpaceStatusFromDB,
    updateSpaceToDB,
    updateSpaceImagesToDB,
    addSpaceFacilitiesToDB,
    searchAndFilterSpaces,
    removeSpaceFacilitiesToDB,
    getMySpacesFromDB,
    getSpaceByIdFromDB,
    getAllSpacesFromDB,
    getProvidersFromDB,
    getRecentSpacesFromDB,
    getInterestedSpacesFromDB,
};
