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
    stripeSubscriptionId: subscription.id,
    status: 'active',
  });

  if (userSubscription) {
    // Deactivate the subscription
    await Subscription.findByIdAndUpdate(
      userSubscription._id,
      { status: 'canceled' },
      { new: true }
    );

    // Find the user associated with the subscription
    const existingUser = await User.findById(userSubscription?.providerId);

    if (existingUser) {
      // Disable user access
      const disabled = await User.findByIdAndUpdate(
        existingUser._id,
        {
          isSubscribed: false,
        },
        { new: true }
      );
      if (!disabled) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to disable user access'
        );
      }
      console.log({ message: 'User access disabled', disabled });
    } else {
      // User not found
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `User with ID: ${userSubscription.providerId} not found.`
      );
    }
  } else {
    // Subscription not found
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Subscription with ID: ${subscription.id} not found.`
    );
  }
};
