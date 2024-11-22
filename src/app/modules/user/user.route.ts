import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { SpaceSeekerRoutes } from '../spaceSeeker/spaceSeeker.route';
const router = express.Router();

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  UserController.getUserProfile
);

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
    fileUploadHandler(),
    UserController.updateProfile
  );
router.get(
  '/all-users/:role',
  auth(USER_ROLES.ADMIN),
  UserController.getAllUsers
);
router.get(
  '/user-statistic',
  auth(USER_ROLES.ADMIN),
  UserController.userStatistic
);
router.post(
  '/register-device',
  auth(USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER),
  UserController.registerDeviceToken
);

export const UserRoutes = router;
