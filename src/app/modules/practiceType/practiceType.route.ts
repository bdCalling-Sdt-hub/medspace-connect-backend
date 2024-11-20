import express from 'express';
import { PracticeTypeController } from './practiceType.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PracticeTypeValidation } from './practiceType.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(PracticeTypeValidation.createPracticeTypeZodSchema),
  PracticeTypeController.createPracticeType
);
router.get('/', PracticeTypeController.getAllPracticeTypes);
router.get('/:id', PracticeTypeController.getPracticeTypeById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(PracticeTypeValidation.updatePracticeTypeZodSchema),
  PracticeTypeController.updatePracticeType
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  PracticeTypeController.deletePracticeType
);

export const PracticeTypeRoutes = router;
