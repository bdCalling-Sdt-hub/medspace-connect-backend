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
exports.SpaceController = void 0;
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const space_service_1 = require("./space.service");
const space_validation_1 = require("./space.validation");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_1 = require("../../../enums/user");
const createSpace = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let spaceData = req.body.data;
    console.log(req);
    spaceData = yield JSON.parse(spaceData);
    yield space_validation_1.SpaceValidation.createSpaceZodSchema.parseAsync(spaceData);
    const { id } = req.user;
    let spaceImages = [];
    if (req.files && 'spaceImages' in req.files) {
        spaceImages = req.files.spaceImages.map(file => `/spaceImages/${file.filename}`);
    }
    const data = Object.assign(Object.assign({}, spaceData), { providerId: id, spaceImages, facilities: Array.isArray(spaceData.facilities)
            ? spaceData.facilities
            : [spaceData.facilities] });
    const result = yield space_service_1.SpaceService.createSpaceToDB(data, id.toString());
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space created successfully',
        data: result,
    });
}));
const updateSpace = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user.id;
    console.log(data);
    if (!req.user || req.user.role !== user_1.USER_ROLES.SPACEPROVIDER) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not authorized to update this space!');
    }
    let spaceImages = null;
    if (req.files && 'spaceImages' in req.files) {
        spaceImages = req.files.spaceImages.map(file => `/spaceImages/${file.filename}`);
    }
    data.spaceImages = spaceImages;
    const result = yield space_service_1.SpaceService.updateSpaceToDB(id, data, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space updated successfully',
        data: result,
    });
}));
const updateSpaceImages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let spaceImages = [];
    if (req.files && 'spaceImages' in req.files) {
        spaceImages = req.files.spaceImages.map(file => `/spaceImages/${file.filename}`);
    }
    else {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'spaceImages are required!');
    }
    const userId = req.user.id;
    const result = yield space_service_1.SpaceService.updateSpaceImagesToDB(id, spaceImages, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space images updated successfully',
        data: result,
    });
}));
const addSpaceFacilities = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body.facilities;
    const result = yield space_service_1.SpaceService.addSpaceFacilitiesToDB(id, data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space facilities updated successfully',
        data: result,
    });
}));
const removeSpaceFacilities = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body.facilities;
    const result = yield space_service_1.SpaceService.removeSpaceFacilitiesToDB(id, data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space facilities removed successfully',
        data: result,
    });
}));
const getSpaceById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield space_service_1.SpaceService.getSpaceByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space fetched successfully',
        data: result,
    });
}));
const getAllSpaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paginationOptions = {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    };
    const result = yield space_service_1.SpaceService.getAllSpacesFromDB(paginationOptions);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Spaces fetched successfully',
        data: result.data,
        pagination: result.meta,
    });
}));
const filterSpaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const result = yield space_service_1.SpaceService.searchAndFilterSpaces(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Spaces fetched successfully',
        data: result,
    });
}));
const getProviders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield space_service_1.SpaceService.getProvidersFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Providers fetched successfully',
        data: result,
    });
}));
const getSpaceStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield space_service_1.SpaceService.getSpaceStatusFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Space status fetched successfully',
        data: result,
    });
}));
const getMySpaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id.toString();
    const result = yield space_service_1.SpaceService.getMySpacesFromDB(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Spaces fetched successfully',
        data: result,
    });
}));
const getRecentSpaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield space_service_1.SpaceService.getRecentSpacesFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Spaces fetched successfully',
        data: result,
    });
}));
const getInterestedSpaces = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id.toString();
    const result = yield space_service_1.SpaceService.getInterestedSpacesFromDB(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Spaces fetched successfully',
        data: result,
    });
}));
exports.SpaceController = {
    createSpace,
    updateSpace,
    updateSpaceImages,
    getMySpaces,
    getInterestedSpaces,
    getSpaceById,
    addSpaceFacilities,
    removeSpaceFacilities,
    getAllSpaces,
    getSpaceStatus,
    getRecentSpaces,
    filterSpaces,
    getProviders,
};
