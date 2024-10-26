import express from 'express';
import { FaqController } from './faq.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidation } from './faq.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(FaqValidation.createFaqZodSchema),
  FaqController.createFaq
);
router.get('/', FaqController.getAllFaqs);
router.get('/:id', FaqController.getFaqById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(FaqValidation.updateFaqZodSchema),
  FaqController.updateFaq
);
router.delete('/:id', auth(USER_ROLES.ADMIN), FaqController.deleteFaq);

export const FaqRoutes = router;
