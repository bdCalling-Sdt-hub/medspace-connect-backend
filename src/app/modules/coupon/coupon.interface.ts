import { Model, Types } from 'mongoose';

export type ICoupon = {
  percent_off: number;
  max_redemptions: number;
  redeem_by: number;
  couponId?: string;
  usageInterval: string;
  name: string;
};

export type CouponModel = Model<ICoupon>;
