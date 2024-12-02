import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';
import colors from 'colors';
import { handleAccountUpdatedEvent } from '../handlers/handleAccountUpdatedEvent';
import { handleSubscriptionCreated } from '../handlers/handleSubscriptionCreated';
import { handleSubscriptionDeleted } from '../handlers/handleSubscriptionDeleted';
import { handleSubscriptionUpdated } from '../handlers/handleSubscriptionUpdated';

const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      logger.error('No stripe signature in request');
      return res.status(400).send('No Stripe signature found');
    }

    const webhookSecret = config.stripe.webhook_secret;

    if (!webhookSecret) {
      logger.error('No webhook secret configured');
      return res.status(500).send('Webhook secret not configured');
    }

    // Log incoming request details
    logger.info('Received webhook request');
    logger.info('Signature:', signature);
    logger.info('Body type:', typeof req.body);
    logger.info('Body is Buffer:', Buffer.isBuffer(req.body));

    // Construct the event - req.body should already be a Buffer
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );

    logger.info('Event constructed successfully:', event.type);

    // Handle the event
    const data = event.data.object as Stripe.Subscription | Stripe.Account;
    const eventType = event.type;

    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data as Stripe.Subscription);
        break;

      case 'account.updated':
        await handleAccountUpdatedEvent(data as Stripe.Account);
        break;

      default:
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export default handleStripeWebhook;
