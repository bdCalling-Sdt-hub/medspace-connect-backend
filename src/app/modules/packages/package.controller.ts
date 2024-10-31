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

export const PackageController = {
  createPackage,
  getSinglePackage,
  getAllPackages,
  deletePackage,
  updatePackage,
};
