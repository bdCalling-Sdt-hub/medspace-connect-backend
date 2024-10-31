import { StatusCodes } from 'http-status-codes';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../user/user.interface';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';
import { stripeHelper } from '../../../helpers/stripeHelper';
import config from '../../../config';
import { emailHelper } from '../../../helpers/emailHelper';
import Stripe from 'stripe';

const createPackageToDB = async (payload: IPackage, user: any) => {
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });

  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }

  const stripeProduct = await stripeHelper.createStripeProduct(
    payload.name,
    `This is the ${payload.name} package with ${payload.allowedSpaces} spaces allowed`,
    payload.price
  );
  // Add Stripe IDs to payload
  const packageWithStripe = {
    ...payload,
    stripeProductId: stripeProduct.id,
    paymentLink: stripeProduct.paymentLink,
  };

  const result = await Package.create(packageWithStripe);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create package!');
  }
  return result;
};

const getAllPackagesFromDB = async () => {
  const result = await Package.find();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No packages found');
  }
  return result;
};

const getSinglePackageFromDB = async (id: string): Promise<IPackage | null> => {
  const result = await Package.findOne({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  return result;
};

const updatePackageToDB = async (
  id: string,
  payload: IPackage
): Promise<IPackage | null> => {
  const isExist = await Package.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  const result = await Package.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deletePackageFromDB = async (id: string): Promise<IPackage | null> => {
  const isExist = await Package.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  const result = await Package.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete package');
  }
  return result;
};

const buyPackageToDB = async (
  id: string,
  user: any
): Promise<{ url: string }> => {
  const isExistPackage = await Package.findOne({ _id: id });
  if (!isExistPackage) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  const isExistUser = await User.findById(user.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Create or get Stripe customer
  let customer;
  if (!isExistUser.stripeCustomerId) {
    customer = await stripeHelper.stripe.customers.create({
      email: isExistUser.email,
      metadata: {
        userId: isExistUser._id.toString(),
      },
    });

    await User.findByIdAndUpdate(user.id, {
      stripeCustomerId: customer.id,
    });
  } else {
    customer = await stripeHelper.stripe.customers.retrieve(
      isExistUser.stripeCustomerId
    );
  }

  // Create Stripe Checkout Session
  const stripeProduct = await stripeHelper.stripe.products.retrieve(
    isExistPackage.stripeProductId!
  );

  const session = await stripeHelper.createCheckoutSession(
    stripeProduct,
    customer.id,
    `${config.client_url}/payment/success?package=${id}`,
    `${config.client_url}/payment/cancel`,
    {
      packageId: id,
      userId: user.id,
    }
  );

  return { url: session.url! };
};

const cancelSubscription = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user || !user.stripeCustomerId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const subscriptions = await stripeHelper.stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
  });

  if (subscriptions.data.length) {
    await Promise.all(
      subscriptions.data.map(sub =>
        stripeHelper.stripe.subscriptions.update(sub.id, {
          cancel_at_period_end: true,
        })
      )
    );
  }

  await User.findByIdAndUpdate(userId, {
    $unset: { plan: 1, planPurchasedAt: 1, postLimit: 1 },
  });
};

const getSubscriptionStatus = async (userId: string) => {
  const user = await User.findById(userId).populate('plan');
  if (!user?.stripeCustomerId) {
    return {
      status: 'NO_SUBSCRIPTION',
      package: null,
      currentPeriodEnd: null,
    };
  }

  const subscriptions = await stripeHelper.stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
    expand: ['data.default_payment_method'],
  });

  if (!subscriptions.data.length) {
    return {
      status: 'INACTIVE',
      package: user.plan,
      currentPeriodEnd: null,
    };
  }

  const subscription = subscriptions.data[0];

  return {
    status: subscription.cancel_at_period_end ? 'CANCELLING' : 'ACTIVE',
    package: user.plan,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    renewalDate: new Date(subscription.current_period_end * 1000),
    paymentMethod: subscription.default_payment_method,
    subscriptionId: subscription.id,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
};

export const PackageService = {
  createPackageToDB,
  deletePackageFromDB,
  updatePackageToDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
  buyPackageToDB,
  cancelSubscription,
  getSubscriptionStatus,
};
