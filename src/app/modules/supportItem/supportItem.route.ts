import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SupportItemValidation } from './supportItem.validation';
import { SupportItemController } from './supportItem.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(SupportItemValidation.createSupportItemZodSchema),
  SupportItemController.createSupportItemControllerFunction
);
router.get('/', SupportItemController.getAllSupportItemControllerFunction);
router.get('/:id', SupportItemController.getSupportItemByIdControllerFunction);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(SupportItemValidation.updateSupportItemZodSchema),
  SupportItemController.updateSupportItemByIdControllerFunction
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  SupportItemController.deleteSupportItemByIdControllerFunction
);
export const SupportItemRoute = router;
