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
  const isExistUser = await User.findById(userId);
  if (!activeSubscription || !isExistUser) {
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
    const deletedSubscription = await Subscription.findByIdAndDelete(
      activeSubscription._id
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSubscribed: false, subscription: null },
      { new: true }
    );
    return {
      deletedSubscription,
      updatedUser,
      canceled,
    };
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
