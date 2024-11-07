import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConversationController } from './conversation.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/start',
  auth(USER_ROLES.SPACESEEKER),
  ConversationController.startConversation
);
router.get(
  '/details',
  auth(USER_ROLES.ADMIN),
  ConversationController.getAllConversationStatus
);
router.get(
  '/monthly-status',
  auth(USER_ROLES.ADMIN),
  ConversationController.getMonthlyConversation
);
router.post(
  '/:conversationId/message',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  fileUploadHandler(),
  ConversationController.sendMessage
);

router.get(
  '/:conversationId',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.getConversation
);

router.patch(
  '/:conversationId/read',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.markMessagesAsRead
);

router.get(
  '/',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.getUserConversations
);

router.delete(
  '/:conversationId',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.deleteConversation
);

// router.patch(
//   '/:conversationId/status',
//   auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
//   ConversationController.updateConversationStatus
// );

router.get(
  '/unread-count',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.getUnreadMessageCount
);

router.get(
  '/:conversationId/search',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
  ConversationController.searchMessages
);

export const ConversationRoutes = router;
