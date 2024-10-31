import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/stripe';
import { Subscription } from './subscription.model';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { Package } from '../packages/package.model';

const cancelSubscription = async (userId: string): Promise<any> => {
  // Find the active subscription
  const activeSubscription = await Subscription.findOne({
    providerId: userId,
    status: 'active',
  });

  if (!activeSubscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active subscription found');
  }

  try {
    const canceled = await stripe.subscriptions.cancel(
      activeSubscription.stripeSubscriptionId
    );
    if (canceled.status !== 'canceled') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to cancel subscription'
      );
    }
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      activeSubscription._id,
      { status: 'canceled' },
      { new: true }
    );
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSubscribed: false },
      { new: true }
    );
    return { updatedSubscription, updatedUser, canceled };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel subscription'
    );
  }
};

export const SubscriptionServices = {
  cancelSubscription,
};
