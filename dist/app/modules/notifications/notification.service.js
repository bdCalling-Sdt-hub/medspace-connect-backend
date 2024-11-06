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
exports.NotificationService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const notification_model_1 = require("./notification.model");
const user_1 = require("../../../enums/user");
const user_model_1 = require("../user/user.model");
const kafkaHelper_1 = require("../../../helpers/kafkaHelper");
const sendNotificationToReceiver = (notification, io) => __awaiter(void 0, void 0, void 0, function* () {
    if (!notification.receiverId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Receiver ID is required!');
    }
    const result = yield notification_model_1.Notification.create(notification);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to send notification!');
    }
    // Publish to Kafka - let the consumer handle Socket.IO notification
    yield kafkaHelper_1.kafkaHelper.producer.send({
        topic: 'notifications',
        messages: [{ value: JSON.stringify(result) }],
    });
    return result;
});
const getAllNotificationsFromDB = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.find({ receiverId });
    return result;
});
const sendNotificationToAllUserOfARole = (notification, role, io) => __awaiter(void 0, void 0, void 0, function* () {
    if (role !== user_1.USER_ROLES.SPACEPROVIDER &&
        role !== user_1.USER_ROLES.SPACESEEKER &&
        role !== user_1.USER_ROLES.ADMIN) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid role for sending notification!');
    }
    const users = yield user_model_1.User.find({ role }, '_id');
    const notifications = users.map(user => (Object.assign(Object.assign({}, notification), { receiverId: user._id })));
    const result = yield notification_model_1.Notification.insertMany(notifications);
    // Publish notifications to Kafka in batches
    for (let i = 0; i < result.length; i += 100) {
        const batch = result.slice(i, i + 100);
        yield kafkaHelper_1.kafkaHelper.producer.send({
            topic: 'notifications',
            messages: batch.map(notif => ({ value: JSON.stringify(notif) })),
        });
    }
    return result;
});
const readAllNotifications = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ receiverId }, { status: 'read' });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to read notifications!');
    }
    const notifications = yield notification_model_1.Notification.find({ receiverId });
    return notifications;
});
const clearNotifications = (receiverId, type, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.deleteMany({
        receiverId,
        type,
        'data.conversationId': data.conversationId,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to clear notifications!');
    }
    return result;
});
const getNotificationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Notification not found!');
    }
    return result;
});
exports.NotificationService = {
    sendNotificationToReceiver,
    sendNotificationToAllUserOfARole,
    getAllNotificationsFromDB,
    readAllNotifications,
    clearNotifications,
    getNotificationById,
};
