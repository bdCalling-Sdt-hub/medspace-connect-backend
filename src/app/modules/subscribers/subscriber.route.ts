import express from 'express';
import { SubscriberController } from './subscriber.controller';
const router = express.Router();

router.post('/create', SubscriberController.createSubscriber);
router.get('/', SubscriberController.getAllSubscribers);
router.get('/:id', SubscriberController.getSubscriberById);
router.get('/email/:email', SubscriberController.getSubscriberByEmail);
router.delete('/:id', SubscriberController.deleteSubscriber);

export const SubscriberRoutes = router;
