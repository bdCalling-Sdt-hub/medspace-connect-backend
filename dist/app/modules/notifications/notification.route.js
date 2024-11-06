"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const notification_validation_1 = require("./notification.validation");
const router = express_1.default.Router();
router.post('/send', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), (0, validateRequest_1.default)(notification_validation_1.NotificationValidation.sendNotificationToReceiverZodSchema), notification_controller_1.NotificationController.sendNotificationToReceiver);
router.post('/send-to-all', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), notification_controller_1.NotificationController.sendNotificationToAllUserOfARole);
router.patch('/read', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), notification_controller_1.NotificationController.readAllNotifications);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), notification_controller_1.NotificationController.getAllNotificationsFromDB);
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), notification_controller_1.NotificationController.getNotificationById);
exports.NotificationRoutes = router;
