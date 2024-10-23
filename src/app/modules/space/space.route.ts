import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { SpaceController } from './space.controller';
import { SpaceValidation } from './space.validation';
const router = express.Router();

router.post(
  '/create-space',
  auth(USER_ROLES.SPACEPROVIDER),
  fileUploadHandler(),
  SpaceController.createSpace
);
router.get('/filter', SpaceController.filterSpaces);

router.patch(
  '/:id',
  auth(USER_ROLES.SPACEPROVIDER),
  validateRequest(SpaceValidation.updateSpaceZodSchema),
  SpaceController.updateSpace
);
router.patch(
  '/:id/images',
  auth(USER_ROLES.SPACEPROVIDER),
  fileUploadHandler(),
  SpaceController.updateSpaceImages
);
router.patch(
  '/:id/facilities/add',
  auth(USER_ROLES.SPACEPROVIDER),
  SpaceController.addSpaceFacilities
);
router.patch(
  '/:id/facilities/remove',
  auth(USER_ROLES.SPACEPROVIDER),
  SpaceController.removeSpaceFacilities
);
router.get('/:id', SpaceController.getSpaceById);
router.get('/', SpaceController.getAllSpaces);

export const SpaceRoutes = router;
