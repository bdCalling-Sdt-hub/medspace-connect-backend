import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  try {
    // Use a single query to find and update the subscription
    const isExistSubscription = await Subscription.findOne({
      stripeSubscriptionId: data.id,
    });
    if (!isExistSubscription) {
      return {
        subscription: null,
        user: null,
      };
    }
    const updatedSubscription = await Subscription.findOneAndUpdate(
      {
        stripeSubscriptionId: data.id,
        status: 'active',
      },
      { status: data.status },
      { new: true }
    );

    if (!updatedSubscription) {
      console.log(`Subscription with ID: ${data.id} not updated.`);
      return {
        subscription: null,
        user: null,
      };
    }

    // Use a single query to find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      updatedSubscription.providerId,
      {
        isSubscribed: false,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `User with ID: ${updatedSubscription.providerId} not found.`
      );
    }

    return {
      subscription: updatedSubscription,
      user: updatedUser,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error processing subscription deletion'
    );
  }
};
