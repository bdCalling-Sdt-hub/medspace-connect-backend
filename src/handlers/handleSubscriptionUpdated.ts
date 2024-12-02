import { StatusCodes } from 'http-status-codes';
import { Subscription } from '../app/modules/subscription/subscription.model';
import Stripe from 'stripe';
import ApiError from '../errors/ApiError';
import { User } from '../app/modules/user/user.model';

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  try {
    // Use a single query to find and update the subscription
    const isExistSubscription = await Subscription.findOne({
      stripeSubscriptionId: data.id,
    });
    if (!isExistSubscription) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Subscription with ID: ${data.id} not found.`
      );
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
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Subscription with ID: ${data.id} not updated.`
      );
    }

    // Use a single query to find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      updatedSubscription.providerId,
      {
        isSubscribed: data.status === 'active' || data.status === 'incomplete',
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
