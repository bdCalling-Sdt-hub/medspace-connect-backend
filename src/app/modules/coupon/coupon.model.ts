import { Schema, model } from 'mongoose';
import { ICoupon, CouponModel } from './coupon.interface';

const couponSchema = new Schema<ICoupon, CouponModel>(
  {
    percent_off: { type: Number, required: true },
    max_redemptions: { type: Number, required: true },
    redeem_by: { type: Number, required: true },
    couponId: { type: String, required: false },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Coupon = model<ICoupon, CouponModel>('Coupon', couponSchema);
