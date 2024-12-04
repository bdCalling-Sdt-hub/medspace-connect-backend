import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Coupon } from './coupon.model';
import { ICoupon } from './coupon.interface';
import { stripeHelper } from '../../../helpers/stripeHelper';
import Stripe from 'stripe';
import { COUPON_USAGE_INTERVAL } from '../../../enums/coupons';

const createCoupon = async (payload: ICoupon): Promise<ICoupon> => {
  if (
    payload.usageInterval !== COUPON_USAGE_INTERVAL.forever &&
    payload.usageInterval !== COUPON_USAGE_INTERVAL.once
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid usageInterval!');
  }
  const coupon: Stripe.Coupon = await stripeHelper.createCoupon(
    payload.percent_off,
    payload.max_redemptions,
    payload.usageInterval,
    payload.redeem_by
  );
  if (!coupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create coupon!');
  }
  const promoCode: Stripe.PromotionCode =
    await stripeHelper.createPromotionCode(coupon.id, payload.name);
  payload.couponId = coupon.id;
  if (!promoCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create promotion code!'
    );
  }
  const result = await Coupon.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create coupon!');
  }
  return result;
};

const getAllCoupons = async (
  search: string,
  page: number | null,
  limit: number | null
): Promise<ICoupon[]> => {
  const query = search
    ? {
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }
    : {};
  let queryBuilder = Coupon.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};

const getCouponById = async (id: string): Promise<ICoupon | null> => {
  const result = await Coupon.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon not found!');
  }
  return result;
};

const deleteCoupon = async (id: string): Promise<ICoupon | null> => {
  const isExistCoupon = await getCouponById(id);
  if (!isExistCoupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon not found!');
  }
  const deleteCoupon = await stripeHelper.deleteCoupon(
    isExistCoupon.couponId as string
  );
  if (!deleteCoupon) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete coupon!');
  }
  const result = await Coupon.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete coupon!');
  }
  return result;
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  deleteCoupon,
};
