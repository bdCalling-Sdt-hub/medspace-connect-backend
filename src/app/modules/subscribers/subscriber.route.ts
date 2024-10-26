import express from 'express';
import { SubscriberController } from './subscriber.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/create', SubscriberController.createSubscriber);
router.get('/', SubscriberController.getAllSubscribers);
router.get('/:id', SubscriberController.getSubscriberById);
router.get('/email/:email', SubscriberController.getSubscriberByEmail);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  SubscriberController.deleteSubscriber
);

export const SubscriberRoutes = router;
