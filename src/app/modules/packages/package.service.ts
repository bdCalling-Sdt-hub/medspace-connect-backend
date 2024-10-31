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

export const PackageService = {
  createPackageToDB,
  deletePackageFromDB,
  updatePackageToDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
};
