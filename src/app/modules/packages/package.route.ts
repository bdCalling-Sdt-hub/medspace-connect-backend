import express from 'express';
import { PackageController } from './package.controller';
import { PackageValidation } from './package.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';
import { PackageService } from './package.service';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(PackageValidation.createPackageZodSchema),
  PackageController.createPackage
);
router.get(
  '/subscribed',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.getSubscribedPackages
);
router.get('/get-all', PackageController.getAllPackages);
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(PackageValidation.updatePackageZodSchema),
  PackageController.updatePackage
);

router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN),
  PackageController.deletePackage
);
router.get('/get/:id', PackageController.getSinglePackage);

export const packageRoutes = router;
