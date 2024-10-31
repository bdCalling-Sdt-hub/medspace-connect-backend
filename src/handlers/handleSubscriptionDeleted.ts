import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  // Retrieve the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(data.id);

  // Find the current active subscription
  const userSubscription = await Subscription.findOne({
    customerId: subscription.customer,
    status: 'active',
  });

  if (userSubscription) {
    // Deactivate the subscription
    await Subscription.findByIdAndUpdate(
      userSubscription._id,
      { status: 'deactivated' },
      { new: true }
    );

    // Find the user associated with the subscription
    const existingUser = await User.findById(userSubscription?.userId);

    if (existingUser) {
      // Disable user access
      await User.findByIdAndUpdate(
        existingUser._id,
        {
          hasAccess: false,
        },
        { new: true }
      );
    } else {
      // User not found
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `User with ID: ${userSubscription.userId} not found.`
      );
    }
  } else {
    // Subscription not found
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Subscription with Customer ID: ${subscription.customer} not found.`
    );
  }
};
