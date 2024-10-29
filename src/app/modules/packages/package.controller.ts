import { Request, Response } from 'express';
import { PackageService } from './package.service';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../../../enums/user';
import catchAsync from '../../../shared/catchAsync';
import { User } from '../user/user.model';
import { Package } from './package.model';
import { stripeHelper } from '../../../helpers/stripeHelper';
import config from '../../../config';

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const { ...packageData } = req.body;
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }
  const result = await PackageService.createPackageToDB(packageData, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getAllPackagesFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Packages retrieved successfully',
    data: result,
  });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package id is required');
  }
  const result = await PackageService.getSinglePackageFromDB(id.toString());
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package retrieved successfully',
    data: result,
  });
});
const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...packageData } = req.body;
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }

  const result = await PackageService.updatePackageToDB(
    id.toString(),
    packageData
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }
  const result = await PackageService.deletePackageFromDB(id.toString());
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Package deleted successfully',
    data: result,
  });
});
const buyPackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }
  const isExistSpaceProvider = await User.findOne({
    _id: user.id,
    role: USER_ROLES.SPACEPROVIDER,
  });
  if (!isExistSpaceProvider) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }
  const result = await PackageService.buyPackageToDB(id.toString(), user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Checkout session created successfully',
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeHelper.stripe.webhooks.constructEvent(
      req.body,
      sig!,
      config.stripe.webhook_secret!
    );
  } catch (err) {
    res
      .status(400)
      .send(`Webhook Error: ${err instanceof Error ? err.message : err}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await PackageService.handleCheckoutComplete(session);
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      await PackageService.handlePaymentFailed(invoice);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await PackageService.handleSubscriptionCancelled(subscription);
      break;
  }

  res.json({ received: true });
});

const handlePaymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { package: packageId } = req.query;
  const user = req.user;

  if (!packageId || !user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request');
  }

  // Verify the subscription in Stripe
  const subscriptions = await stripeHelper.stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'active',
  });

  if (!subscriptions.data.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No active subscription found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment successful',
    data: null,
  });
});

const handlePaymentCancel = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: false,
    message: 'Payment cancelled',
    data: null,
  });
});

const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    const result = await PackageService.getSubscriptionStatus(user.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Subscription status retrieved successfully',
      data: result,
    });
  }
);

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  await PackageService.cancelSubscription(user.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription cancelled successfully',
    data: null,
  });
});

const changeSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const { packageId } = req.params;
    const user = req.user;

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    await PackageService.changeSubscriptionPlan(user.id, packageId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Subscription plan changed successfully',
      data: null,
    });
  }
);

export const PackageController = {
  createPackage,
  getSinglePackage,
  getAllPackages,
  deletePackage,
  updatePackage,
  buyPackage,
  handleWebhook,
  handlePaymentSuccess,
  handlePaymentCancel,
  getSubscriptionStatus,
  cancelSubscription,
  changeSubscriptionPlan,
};
