import Stripe from 'stripe';
import config from '../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});
const createPaymentLink = async (product: Stripe.Product) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: product.default_price as string,
        quantity: 1,
      },
    ],
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

export const stripeHelper = {
  createStripeProduct,
  createCheckoutSession,
  stripe,
};
