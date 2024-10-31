import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriptionValidation } from './subscription.validation';
const router = express.Router();
router.post('/');
export const SubscriptionRoute = router;
