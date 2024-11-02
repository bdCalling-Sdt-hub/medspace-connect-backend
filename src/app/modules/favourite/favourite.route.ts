import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FavouriteValidation } from './favourite.validation';
import { FavouriteController } from './favourite.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();
router.post(
  '/create',
  auth(USER_ROLES.SPACESEEKER),
  validateRequest(FavouriteValidation.createFavouriteZodSchema),
  FavouriteController.createFavourite
);
router.get(
  '/',
  auth(USER_ROLES.SPACESEEKER),
  FavouriteController.getFavouriteByUserId
);
router.patch(
  '/:id',
  auth(USER_ROLES.SPACESEEKER),
  FavouriteController.updateFavourite
);
router.delete(
  '/:id',
  auth(USER_ROLES.SPACESEEKER),
  FavouriteController.deleteFavourite
);

export const FavouriteRoute = router;
