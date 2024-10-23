import { StatusCodes } from 'http-status-codes';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../user/user.interface';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';

const createPackageToDB = async (payload: IPackage, user: any) => {
  const isExistAdmin = await User.findOne({
    _id: user.id,
    role: USER_ROLES.ADMIN,
  });

  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }
  const result = await Package.create(payload);
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
): Promise<IPackage | null> => {
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
  const updateUser = await User.findByIdAndUpdate(
    user.id,
    {
      plan: id,
      postLimit: isExistPackage.allowedSpaces,
      planPurchasedAt: new Date(),
    },
    { new: true }
  );
  if (!updateUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to buy package');
  }
  return isExistPackage;
};

export const PackageService = {
  createPackageToDB,
  deletePackageFromDB,
  updatePackageToDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
  buyPackageToDB,
};
