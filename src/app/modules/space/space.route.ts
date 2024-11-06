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

router.get('/status', SpaceController.getSpaceStatus);
router.get('/filter', SpaceController.filterSpaces);
router.get('/providers', SpaceController.getProviders);
router.get('/recent', SpaceController.getRecentSpaces);

router.get(
  '/my-spaces',
  auth(USER_ROLES.SPACEPROVIDER),
  SpaceController.getMySpaces
);
router.get(
  '/interested-spaces',
  auth(USER_ROLES.SPACESEEKER),
  SpaceController.getInterestedSpaces
);
router.patch(
  '/:id',
  auth(USER_ROLES.SPACEPROVIDER),
  fileUploadHandler(),
  // validateRequest(SpaceValidation.updateSpaceZodSchema),
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
