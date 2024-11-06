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
exports.SupportItemController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const supportItem_service_1 = require("./supportItem.service");
const createSupportItemControllerFunction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_service_1.SupportItemService.createSupportItemServiceFunction(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Support item created successfully',
        data: result,
    });
}));
const getAllSupportItemControllerFunction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_service_1.SupportItemService.getAllSupportItemServiceFunction();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Support items fetched successfully',
        data: result,
    });
}));
const getSupportItemByIdControllerFunction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_service_1.SupportItemService.getSupportItemByIdServiceFunction(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Support item fetched successfully',
        data: result,
    });
}));
const updateSupportItemByIdControllerFunction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_service_1.SupportItemService.updateSupportItemByIdServiceFunction(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Support item updated successfully',
        data: result,
    });
}));
const deleteSupportItemByIdControllerFunction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supportItem_service_1.SupportItemService.deleteSupportItemByIdServiceFunction(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Support item deleted successfully',
        data: result,
    });
}));
exports.SupportItemController = {
    createSupportItemControllerFunction,
    getAllSupportItemControllerFunction,
    getSupportItemByIdControllerFunction,
    updateSupportItemByIdControllerFunction,
    deleteSupportItemByIdControllerFunction,
};
