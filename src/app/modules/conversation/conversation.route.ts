import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConversationController } from './conversation.controller';

const router = express.Router();

router.post(
  '/start',
  auth(USER_ROLES.SPACESEEKER),
  ConversationController.startConversation
);

router.post(
  '/:conversationId/message',
  auth(USER_ROLES.SPACESEEKER, USER_ROLES.SPACEPROVIDER),
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

export const ConversationRoutes = router;
