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

const createPackageToDB = async (payload: IPackage, user: any) => {
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });

  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }

  // Create Stripe Product
  const stripeProduct = await stripeHelper.createStripeProduct(
    payload.name,
    `${payload.allowedSpaces} spaces allowed`
  );

  // Create Stripe Price
  const stripePrice = await stripeHelper.createStripePrice(
    stripeProduct.id,
    payload.price,
    payload.duration
  );

  // Add Stripe IDs to payload
  const packageWithStripe = {
    ...payload,
    stripeProductId: stripeProduct.id,
    stripePriceId: stripePrice.id,
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

  const isExistUser = await User.findOne({
    _id: user.id,
    role: USER_ROLES.SPACEPROVIDER,
  });
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

  // Create Stripe Checkout Session with metadata
  const session = await stripeHelper.createCheckoutSession(
    isExistPackage.stripePriceId!,
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
const handleCheckoutComplete = async (session: any) => {
  const { packageId, userId } = session.metadata;

  try {
    const packageDetails = await Package.findById(packageId);
    if (!packageDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Update user's subscription details
    await User.findByIdAndUpdate(userId, {
      plan: packageId,
      planPurchasedAt: new Date(),
      postLimit: packageDetails.allowedSpaces,
    });

    // Send confirmation email
    await emailHelper.sendEmail({
      to: user.email,
      subject: 'Subscription Activated',
      html: `
        <h1>Subscription Activated Successfully</h1>
        <p>Your subscription to ${packageDetails.name} has been activated.</p>
        <p>Package Details:</p>
        <ul>
          <li>Allowed Spaces: ${packageDetails.allowedSpaces}</li>
          <li>Duration: ${packageDetails.duration} months</li>
          <li>Price: $${packageDetails.price}</li>
        </ul>
      `,
    });
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
};

const handlePaymentFailed = async (invoice: any) => {
  const customerId = invoice.customer;

  try {
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Send email notification about failed payment
    await emailHelper.sendEmail({
      to: user.email,
      subject: 'Payment Failed - Action Required',
      html: `
        <h1>Payment Failed</h1>
        <p>Your payment for the subscription has failed.</p>
        <p>Please update your payment method to continue using our services.</p>
        <p>If no action is taken, your subscription may be cancelled.</p>
        <a href="${config.client_url}/dashboard/billing">Update Payment Method</a>
      `,
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

const handleSubscriptionCancelled = async (subscription: any) => {
  const customerId = subscription.customer;

  try {
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Remove subscription details from user
    await User.findByIdAndUpdate(user._id, {
      $unset: {
        plan: 1,
        planPurchasedAt: 1,
        postLimit: 1,
      },
    });

    // Send cancellation confirmation email
    await emailHelper.sendEmail({
      to: user.email,
      subject: 'Subscription Cancelled',
      html: `Your subscription has been cancelled. We hope to see you again soon!`,
    });
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
};

const changeSubscriptionPlan = async (
  userId: string,
  newPackageId: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user?.stripeCustomerId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const newPackage = await Package.findById(newPackageId);
  if (!newPackage?.stripePriceId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  const subscriptions = await stripeHelper.stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
  });

  if (!subscriptions.data.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No active subscription found');
  }

  try {
    // Update the subscription with the new price
    await stripeHelper.stripe.subscriptions.update(subscriptions.data[0].id, {
      items: [
        {
          id: subscriptions.data[0].items.data[0].id,
          price: newPackage.stripePriceId,
        },
      ],
      proration_behavior: 'always_invoice',
    });

    // Update user's package details
    await User.findByIdAndUpdate(userId, {
      plan: newPackageId,
      postLimit: newPackage.allowedSpaces,
    });

    // Send email notification
    await emailHelper.sendEmail({
      to: user.email,
      subject: 'Subscription Plan Changed',
      html: `
        <h1>Subscription Plan Changed</h1>
        <p>Your subscription has been updated to ${newPackage.name}.</p>
        <p>New Package Details:</p>
        <ul>
          <li>Allowed Spaces: ${newPackage.allowedSpaces}</li>
          <li>Duration: ${newPackage.duration} months</li>
          <li>Price: $${newPackage.price}</li>
        </ul>
      `,
    });
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to change subscription plan'
    );
  }
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
  handleCheckoutComplete,
  handlePaymentFailed,
  handleSubscriptionCancelled,
  changeSubscriptionPlan,
};
