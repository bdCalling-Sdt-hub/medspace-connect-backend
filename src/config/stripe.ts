import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});

export default stripe;
