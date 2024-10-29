import Stripe from 'stripe';
import config from '../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});

const createStripeProduct = async (name: string, description?: string) => {
  const product = await stripe.products.create({
    name,
    description,
  });
  return product;
};

const createStripePrice = async (
  productId: string,
  amount: number,
  duration: number
) => {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount * 100, // Convert to cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: duration,
    },
  });
  return price;
};

const createCheckoutSession = async (
  priceId: string,
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
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
  return session;
};

export const stripeHelper = {
  createStripeProduct,
  createStripePrice,
  createCheckoutSession,
  stripe,
};
