import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { User } from './user.model';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { Server } from 'socket.io';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const io: Server = req.app.get('io');
    const result = await UserService.createUserToDB(userData, io);

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
    let profile: any = null;
    let banner: any = null;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/profiles/${req.files.profile[0].filename}`;
    } else if (req.files && 'banner' in req.files && req.files.banner[0]) {
      banner = `/banners/${req.files.banner[0].filename}`;
    }

    const data = {
      profile,
      banner,
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

const userStatistic = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query;
  const result = await UserService.userStatisticFromDB(Number(year));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User statistic retrieved successfully',
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const role = req.params.role.toUpperCase();
  const result = await UserService.getAllUsersFromDB(role, page, limit);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users fetched successfully',
    data: result.data,
    pagination: result.meta,
  });
});
export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  registerDeviceToken,
  getAllUsers,
  userStatistic,
};
