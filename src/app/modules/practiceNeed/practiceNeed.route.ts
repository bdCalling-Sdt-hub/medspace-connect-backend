import express from 'express';
import { PracticeNeedController } from './practiceNeed.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PracticeNeedValidation } from './practiceNeed.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(PracticeNeedValidation.createPracticeNeedZodSchema),
  PracticeNeedController.createPracticeNeed
);
router.get('/', PracticeNeedController.getAllPracticeNeeds);
router.get('/:id', PracticeNeedController.getPracticeNeedById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(PracticeNeedValidation.updatePracticeNeedZodSchema),
  PracticeNeedController.updatePracticeNeed
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  PracticeNeedController.deletePracticeNeed
);

export const PracticeNeedRoutes = router;
