import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { AdminController } from './admin.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { USER_ROLES } from '../../../../enums/user';
const router = Router();
router.post(
  '/add',
  auth(USER_ROLES.ADMIN),
  validateRequest(AdminValidation.createAdminZodSchema),
  AdminController.addAdmin
);
router.delete('/:id', auth(USER_ROLES.ADMIN), AdminController.deleteAdmin);
export const adminRoutes = router;
