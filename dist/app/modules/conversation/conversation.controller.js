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
exports.ConversationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const conversation_service_1 = require("./conversation.service");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const startConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spaceId } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');
    if (!spaceId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'spaceId is required');
    }
    const result = yield conversation_service_1.ConversationService.startConversation(userId, spaceId, io);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Conversation started successfully',
        data: result,
    });
}));
const addMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { content, contentType } = req.body;
    const userId = req.user.id;
    const result = yield conversation_service_1.ConversationService.addMessage(conversationId, userId, content, contentType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Message added successfully',
        data: result,
    });
}));
const getConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const result = yield conversation_service_1.ConversationService.getConversation(conversationId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Conversation retrieved successfully',
        data: result,
    });
}));
const sendMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');
    let mediaFiles = [];
    if (req.files && 'messageFiles' in req.files) {
        mediaFiles = req.files.messageFiles.map(file => `/messageFiles/${file.filename}`);
    }
    const result = yield conversation_service_1.ConversationService.sendMessageToDB(conversationId, userId, message, io, mediaFiles);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
}));
const markMessagesAsRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io');
    const result = yield conversation_service_1.ConversationService.markMessagesAsRead(conversationId, userId, io);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Messages marked as read successfully',
        data: result,
    });
}));
const getUserConversations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const result = yield conversation_service_1.ConversationService.getUserConversations(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User conversations retrieved successfully',
        data: result,
    });
}));
const deleteConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const userId = req.user.id;
    yield conversation_service_1.ConversationService.deleteConversation(conversationId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Conversation deleted successfully',
    });
}));
// const updateConversationStatus = catchAsync(
//   async (req: Request, res: Response) => {
//     const { conversationId } = req.params;
//     const { isActive } = req.body;
//     const userId = req.user.id;
//     const result = await ConversationService.updateConversationStatus(
//       conversationId,
//       userId,
//       isActive
//     );
//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       success: true,
//       message: 'Conversation status updated successfully',
//       data: result,
//     });
//   }
// );
const getUnreadMessageCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const result = yield conversation_service_1.ConversationService.getUnreadMessageCount(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Unread message count retrieved successfully',
        data: result,
    });
}));
const searchMessages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { query } = req.query;
    const userId = req.user.id;
    const result = yield conversation_service_1.ConversationService.searchMessages(conversationId, userId, query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Messages searched successfully',
        data: result,
    });
}));
const getAllConversationStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield conversation_service_1.ConversationService.getAllConversationStatus();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'All conversation status retrieved successfully',
        data: result,
    });
}));
const getMonthlyConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { year } = req.query;
    const result = yield conversation_service_1.ConversationService.getMonthlyConversationStatus(parseInt(year));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Monthly conversation status retrieved successfully',
        data: result,
    });
}));
exports.ConversationController = {
    startConversation,
    addMessage,
    getConversation,
    sendMessage,
    markMessagesAsRead,
    getUserConversations,
    deleteConversation,
    // updateConversationStatus,
    getUnreadMessageCount,
    searchMessages,
    getAllConversationStatus,
    getMonthlyConversation,
};
