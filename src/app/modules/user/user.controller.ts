import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { User } from './user.model';
import ApiError from '../../../errors/ApiError';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Registration successful please check your email for OTP.',
      data: result,
    });
  }
);
const registerDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  const userId = req.user.id;
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { deviceTokens: deviceToken } },
    { new: true }
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device token registered successfully',
  });
});
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let profile;
    if (req.files && 'image' in req.files && req.files.image[0]) {
      profile = `/images/${req.files.image[0].filename}`;
    }

    const data = {
      profile,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

//manage device token
const manageDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const { token, action } = req.body;
  if (!token || !action) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token and action are required'
    );
  }
  if (action !== 'add' && action !== 'remove') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid action action can only be add or remove'
    );
  }
  const userId = req.user.id;
  await UserService.manageDeviceToken(userId, token, action);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device token managed successfully',
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  registerDeviceToken,
  manageDeviceToken,
};
