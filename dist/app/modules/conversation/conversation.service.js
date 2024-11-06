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
exports.ConversationService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const conversation_model_1 = require("./conversation.model");
const space_model_1 = require("../space/space.model");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enums/user");
const mongoose_1 = require("mongoose");
const message_model_1 = require("./message/message.model");
const dateHelper_1 = require("../../../shared/dateHelper");
const kafkaHelper_1 = require("../../../helpers/kafkaHelper");
const notification_service_1 = require("../notifications/notification.service");
const socketHelper_1 = require("../../../helpers/socketHelper");
const startConversation = (spaceSeekerUserId, spaceId, io) => __awaiter(void 0, void 0, void 0, function* () {
    const space = yield space_model_1.Space.findById(spaceId);
    if (!space) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Space not found');
    }
    const spaceSeeker = yield user_model_1.User.findOne({
        _id: spaceSeekerUserId,
        role: user_1.USER_ROLES.SPACESEEKER,
    });
    if (!spaceSeeker) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Space seeker not found');
    }
    const existingConversation = yield conversation_model_1.Conversation.findOne({
        spaceSeeker: spaceSeekerUserId,
        spaceProvider: space.providerId,
        spaceId: spaceId,
    });
    if (existingConversation) {
        return existingConversation;
    }
    const newConversation = yield conversation_model_1.Conversation.create({
        spaceSeeker: spaceSeekerUserId,
        spaceProvider: space.providerId,
        spaceId: spaceId,
        isActive: true,
    });
    if (!newConversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to start conversation');
    }
    const currentDate = new Date();
    const humanReadableDate = (0, dateHelper_1.convertISOToHumanReadable)(currentDate.toISOString());
    const fullMessageData = {
        from: new mongoose_1.Types.ObjectId(space.providerId),
        to: new mongoose_1.Types.ObjectId(spaceSeekerUserId),
        conversationID: newConversation._id,
        spaceID: new mongoose_1.Types.ObjectId(spaceId),
        message: `${spaceSeeker.name} is interested in talking to you about one of your post`,
        data: {
            post: space,
        },
        date: humanReadableDate,
    };
    io.emit(`conversation::${newConversation._id}`, fullMessageData);
    return newConversation;
});
const getConversation = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    if (conversation.spaceSeeker.toString() !== userId &&
        conversation.spaceProvider.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Access denied');
    }
    return conversation;
});
const addMessage = (conversationId_1, senderId_1, message_1, ...args_1) => __awaiter(void 0, [conversationId_1, senderId_1, message_1, ...args_1], void 0, function* (conversationId, senderId, message, mediaFiles = []) {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    const newMessage = {
        from: new mongoose_1.Types.ObjectId(senderId),
        to: new mongoose_1.Types.ObjectId(senderId === conversation.spaceSeeker.toString()
            ? conversation.spaceProvider.toString()
            : conversation.spaceSeeker.toString()),
        conversationID: new mongoose_1.Types.ObjectId(conversationId),
        spaceID: conversation.spaceId,
        message: message,
        status: 'unread',
        data: { mediaFiles },
        date: new Date().toISOString(),
    };
    const result = yield message_model_1.Message.create(newMessage);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to add message');
    }
    const messageData = yield message_model_1.Message.findById(result._id).populate('from to');
    return messageData;
});
const sendMessageToDB = (conversationId_1, senderId_1, message_1, io_1, ...args_1) => __awaiter(void 0, [conversationId_1, senderId_1, message_1, io_1, ...args_1], void 0, function* (conversationId, senderId, message, io, mediaFiles = []) {
    const newMessage = yield addMessage(conversationId, senderId, message, mediaFiles);
    // Publish message to Kafka
    yield kafkaHelper_1.kafkaHelper.producer.send({
        topic: 'new-messages',
        messages: [{ value: JSON.stringify(newMessage) }],
    });
    // Check if the recipient is not currently viewing the conversation
    const recipientId = newMessage.to;
    if (!(0, socketHelper_1.isUserViewingConversation)(recipientId.toString(), conversationId)) {
        // Send notification
        yield notification_service_1.NotificationService.sendNotificationToReceiver({
            receiverId: recipientId,
            title: 'New Message',
            message: `${newMessage.from.name} sent you a new message`,
            type: 'new_message',
            data: { conversationId, messageId: newMessage._id },
        }, io);
    }
    return newMessage;
});
const markMessagesAsRead = (conversationId, userId, io) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield getConversation(conversationId, userId);
    if (!conversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    const updatedMessages = yield message_model_1.Message.updateMany({
        conversationID: conversationId,
        to: userId,
        status: 'unread',
    }, { status: 'read' });
    if (updatedMessages.modifiedCount > 0) {
        // Publish to Kafka
        yield kafkaHelper_1.kafkaHelper.producer.send({
            topic: 'messages-read',
            messages: [{ value: JSON.stringify({ conversationId, userId }) }],
        });
        // Clear notifications related to this conversation for this user
        yield notification_service_1.NotificationService.clearNotifications(userId, 'new_message', {
            conversationId,
        });
    }
    const allMessages = yield message_model_1.Message.find({
        conversationID: conversationId,
        to: userId,
    });
    return allMessages;
});
const getUserConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield conversation_model_1.Conversation.find({
        $or: [{ spaceSeeker: userId }, { spaceProvider: userId }],
    }).populate('spaceId spaceSeeker spaceProvider');
    return conversations;
});
const deleteConversation = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield getConversation(conversationId, userId);
    if (!conversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    yield conversation_model_1.Conversation.findByIdAndDelete(conversationId);
    yield message_model_1.Message.deleteMany({ conversationID: conversationId });
});
// const updateConversationStatus = async (
//   conversationId: string,
//   userId: string,
//   isActive: boolean
// ): Promise<IConversation> => {
//   const conversation = await getConversation(conversationId, userId);
//   if (!conversation) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
//   }
//   const updatedConversation = await Conversation.findByIdAndUpdate(
//     conversationId,
//     { isActive },
//     { new: true }
//   );
//   if (!updatedConversation) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to update conversation'
//     );
//   }
//   return updatedConversation;
// };
const getUnreadMessageCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield message_model_1.Message.countDocuments({
        to: userId,
        status: 'unread',
    });
    return count;
});
const searchMessages = (conversationId, userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield getConversation(conversationId, userId);
    if (!conversation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Conversation not found');
    }
    const messages = yield message_model_1.Message.find({
        conversationID: conversationId,
        $text: { $search: query },
    }).sort({ score: { $meta: 'textScore' } });
    return messages;
});
const getAllConversationStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield conversation_model_1.Conversation.find({}).populate('spaceId spaceSeeker spaceProvider');
    const returnData = conversations.map((conversation) => ({
        owner: {
            id: conversation.spaceProvider._id,
            name: conversation.spaceProvider.name,
            profilePicture: conversation.spaceProvider.profile,
        },
        space: {
            id: conversation.spaceId._id,
            postTitle: conversation.spaceId.title,
            practiceType: conversation.spaceId.practiceFor,
            openingDate: conversation.spaceId.openingDate,
            price: conversation.spaceId.price,
        },
        spaceSeeker: {
            id: conversation.spaceSeeker._id,
            name: conversation.spaceSeeker.name,
            profilePicture: conversation.spaceSeeker.profile,
        },
    }));
    return returnData;
});
const getMonthlyConversationStatus = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const months = [
        { name: 'Jan', conversations: 0 },
        { name: 'Feb', conversations: 0 },
        { name: 'Mar', conversations: 0 },
        { name: 'Apr', conversations: 0 },
        { name: 'May', conversations: 0 },
        { name: 'Jun', conversations: 0 },
        { name: 'Jul', conversations: 0 },
        { name: 'Aug', conversations: 0 },
        { name: 'Sep', conversations: 0 },
        { name: 'Oct', conversations: 0 },
        { name: 'Nov', conversations: 0 },
        { name: 'Dec', conversations: 0 },
    ];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    const monthlyConversation = yield conversation_model_1.Conversation.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lt: endDate },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    // Use Promise.all with map instead of forEach
    yield Promise.all(monthlyConversation.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
        const monthIndex = conversation._id - 1;
        // Initialize price if not already initialized
        //@ts-ignore
        months[monthIndex].totalEarnings = 0;
        months[monthIndex].conversations = conversation.count;
        const conversationsForMonth = yield conversation_model_1.Conversation.find({
            createdAt: {
                $gte: new Date(year, monthIndex, 1),
                $lt: new Date(year, monthIndex + 1, 1),
            },
        }).populate('spaceId');
        // //@ts-ignore
        // months[monthIndex].space = conversationsForMonth[0]?.spaceId;
        //@ts-ignore
        months[monthIndex].totalEarnings = conversationsForMonth.reduce((total, earning) => {
            var _a;
            return total + (((_a = earning.spaceId) === null || _a === void 0 ? void 0 : _a.price) || 0);
        }, 0);
    })));
    return months;
});
exports.ConversationService = {
    startConversation,
    addMessage,
    getConversation,
    sendMessageToDB,
    markMessagesAsRead,
    getUserConversations,
    deleteConversation,
    // updateConversationStatus,
    getUnreadMessageCount,
    searchMessages,
    getMonthlyConversationStatus,
    getAllConversationStatus,
};
