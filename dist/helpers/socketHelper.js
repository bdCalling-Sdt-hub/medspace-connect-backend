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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatNamespace = exports.isUserViewingConversation = void 0;
const logger_1 = require("../shared/logger");
const conversation_service_1 = require("../app/modules/conversation/conversation.service");
const activeUsers = new Map();
const isUserViewingConversation = (userId, conversationId) => {
    var _a;
    return ((_a = activeUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.has(conversationId)) || false;
};
exports.isUserViewingConversation = isUserViewingConversation;
const chatNamespace = (io) => {
    io.on('connection', (socket) => {
        logger_1.logger.info('A user connected to chat');
        socket.on('join_conversation', (_a) => __awaiter(void 0, [_a], void 0, function* ({ conversationId, userId }) {
            var _b;
            socket.join(conversationId);
            if (!activeUsers.has(userId)) {
                activeUsers.set(userId, new Set());
            }
            (_b = activeUsers.get(userId)) === null || _b === void 0 ? void 0 : _b.add(conversationId);
            logger_1.logger.info(`User ${userId} joined conversation: ${conversationId}`);
            yield conversation_service_1.ConversationService.markMessagesAsRead(conversationId, userId, io);
        }));
        socket.on('leave_conversation', ({ userId, conversationId }) => {
            var _a, _b;
            (_a = activeUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.delete(conversationId);
            if (((_b = activeUsers.get(userId)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
                activeUsers.delete(userId);
            }
            logger_1.logger.info(`User ${userId} left conversation ${conversationId}`);
        });
        socket.on('mark_messages_read', (_a) => __awaiter(void 0, [_a], void 0, function* ({ conversationId, userId }) {
            yield conversation_service_1.ConversationService.markMessagesAsRead(conversationId, userId, io);
        }));
        socket.on('disconnect', () => {
            for (const [userId, conversations] of activeUsers.entries()) {
                if (Array.from(conversations).some(conversationId => socket.rooms.has(conversationId))) {
                    activeUsers.delete(userId);
                    logger_1.logger.info(`User ${userId} disconnected from chat`);
                    break;
                }
            }
        });
    });
};
exports.chatNamespace = chatNamespace;
