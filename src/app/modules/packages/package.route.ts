import express from 'express';
import { PackageController } from './package.controller';
import { PackageValidation } from './package.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(PackageValidation.createPackageZodSchema),
  PackageController.createPackage
);
router.get('/get-all', PackageController.getAllPackages);
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(PackageValidation.updatePackageZodSchema),
  PackageController.updatePackage
);
router.post(
  '/buy/:id',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.buyPackage
);
router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN),
  PackageController.deletePackage
);
router.get('/get/:id', PackageController.getSinglePackage);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PackageController.handleWebhook
);
router.get(
  '/payment/success',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.handlePaymentSuccess
);
router.get(
  '/payment/cancel',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.handlePaymentCancel
);
router.get(
  '/subscription/status',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.getSubscriptionStatus
);
router.post(
  '/subscription/cancel',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.cancelSubscription
);
router.post(
  '/subscription/change/:packageId',
  auth(USER_ROLES.SPACEPROVIDER),
  PackageController.changeSubscriptionPlan
);

export const packageRoutes = router;
