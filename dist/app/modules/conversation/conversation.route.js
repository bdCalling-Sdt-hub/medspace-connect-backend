"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const conversation_controller_1 = require("./conversation.controller");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const router = express_1.default.Router();
router.post('/start', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER), conversation_controller_1.ConversationController.startConversation);
router.get('/details', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), conversation_controller_1.ConversationController.getAllConversationStatus);
router.get('/monthly-status', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), conversation_controller_1.ConversationController.getMonthlyConversation);
router.post('/:conversationId/message', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), (0, fileUploadHandler_1.default)(), conversation_controller_1.ConversationController.sendMessage);
router.get('/:conversationId', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.getConversation);
router.patch('/:conversationId/read', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.markMessagesAsRead);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.getUserConversations);
router.delete('/:conversationId', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.deleteConversation);
// router.patch(
//   '/:conversationId/status',
//   auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
//   ConversationController.updateConversationStatus
// );
router.get('/unread-count', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.getUnreadMessageCount);
router.get('/:conversationId/search', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER, user_1.USER_ROLES.SPACEPROVIDER), conversation_controller_1.ConversationController.searchMessages);
exports.ConversationRoutes = router;
