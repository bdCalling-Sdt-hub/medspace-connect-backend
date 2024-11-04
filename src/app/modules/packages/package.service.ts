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
import { Subscription } from '../subscription/subscription.model';
import { getSubscriptionPeriodDates } from '../../../shared/getDeadline';

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
    priceId: stripeProduct.priceId,
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
const getSubscribedPackagesfromDB = async (id: string): Promise<any> => {
  const isExistUser = await User.findById(id).populate('subscription');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (!isExistUser.subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User has no subscription');
  }
  const isExistPackage = await Package.findOne({
    // @ts-expect-error
    _id: isExistUser.subscription.package,
  });
  //@ts-ignore
  const { start: periodStart, end: periodEnd } = getSubscriptionPeriodDates(new Date(isExistUser.subscription.createdAt));

  if (!isExistPackage) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  const finalResult = {
  //@ts-ignore
    ...isExistPackage._doc,
    
    deadline:periodEnd.toLocaleDateString("en-GB",
      { year: 'numeric', month: 'long', day: 'numeric' }
    ),
  }
  return finalResult;
};

export const PackageService = {
  createPackageToDB,
  deletePackageFromDB,
  updatePackageToDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
  getSubscribedPackagesfromDB,
};
