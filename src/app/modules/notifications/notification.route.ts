import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';

const router = express.Router();

router.post(
  '/send',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  validateRequest(NotificationValidation.sendNotificationToReceiverZodSchema),
  NotificationController.sendNotificationToReceiver
);
router.post(
  '/send-to-all',
  auth(USER_ROLES.ADMIN),
  NotificationController.sendNotificationToAllUserOfARole
);
router.patch(
  '/read',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  NotificationController.readAllNotifications
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  NotificationController.getAllNotificationsFromDB
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  NotificationController.getNotificationById
);

export const NotificationRoutes = router;
