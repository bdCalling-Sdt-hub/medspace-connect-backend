import Stripe from 'stripe';
import config from '../config';
import { COUPON_USAGE_INTERVAL } from '../enums/coupons';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2024-11-20.acacia',
});
const createPaymentLink = async (product: Stripe.Product) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: 'http://medspaceconnect.com',
      },
    },
  });

  return paymentLink.url;
};
const createStripeProduct = async (
  name: string,
  description: string = 'Another medspace connect package',
  price: number
) => {
  const product: Stripe.Product = await stripe.products.create({
    name,
    description,
    default_price_data: {
      currency: 'usd',
      unit_amount: price * 100,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
  });
  const paymentLink = await createPaymentLink(product);
  return { ...product, priceId: product.default_price as string, paymentLink };
};

const createCheckoutSession = async (
  product: Stripe.Product,
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: { packageId: string; userId: string }
) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
  return session;
};
const createCoupon = async (
  percent_off: number,
  max_redemptions: number,
  usageInterval: COUPON_USAGE_INTERVAL.forever | COUPON_USAGE_INTERVAL.once,
  redeem_by: number
) => {
  try {
    const coupon = await stripe.coupons.create({
      percent_off,
      duration: usageInterval,
      max_redemptions,
      redeem_by,
    });
    return coupon;
  } catch (error) {
    console.error('Coupon creation error:', error);
    throw error;
  }
};
const createPromotionCode = async (couponId: string, name: string) => {
  const promotionCode = await stripe.promotionCodes.create({
    coupon: couponId,
    code: name,
  });

  return promotionCode;
};
const deleteCoupon = async (couponId: string) => {
  try {
    const deletedCoupon = await stripe.coupons.del(couponId);
    return deletedCoupon;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};
export const stripeHelper = {
  createStripeProduct,
  createCheckoutSession,
  createCoupon,
  createPromotionCode,
  deleteCoupon,
  stripe,
};
