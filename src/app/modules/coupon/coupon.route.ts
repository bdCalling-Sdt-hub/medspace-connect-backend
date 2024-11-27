import express from 'express';
import { CouponController } from './coupon.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CouponValidation } from './coupon.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(CouponValidation.createCouponZodSchema),
  CouponController.createCoupon
);
router.get('/', CouponController.getAllCoupons);
router.get('/:id', CouponController.getCouponById);

router.delete('/:id', auth(USER_ROLES.ADMIN), CouponController.deleteCoupon);

export const CouponRoutes = router;
