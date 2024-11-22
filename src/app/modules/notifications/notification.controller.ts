import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { INotification } from './notification.interface';

const sendNotificationToReceiver = catchAsync(
  async (req: Request, res: Response) => {
    const { ...notification }: INotification = req.body;
    const io = req.app.get('io');
    const result: any = await NotificationService.sendNotificationToReceiver(
      notification,
      io
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification sent successfully',
      data: result,
    });
  }
);

const sendNotificationToAllUserOfARole = catchAsync(
  async (req: Request, res: Response) => {
    const { notification } = req.body;
    if (!notification.role) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Role is required for sending notification to all users!'
      );
    }
    const io = req.app.get('io');
    const result = await NotificationService.sendNotificationToAllUserOfARole(
      notification,
      notification.role,
      io
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification sent successfully',
      data: result,
    });
  }
);

const readAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const receiverId = req.user.id;
  const result = await NotificationService.readAllNotifications(receiverId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications read successfully',
    data: result,
  });
});

const getAllNotificationsFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const receiverId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.getAllNotificationsFromDB(
      receiverId,
      role
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notifications fetched successfully',
      data: result,
    });
  }
);

const getNotificationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NotificationService.getNotificationById(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification fetched successfully',
    data: result,
  });
});

export const NotificationController = {
  sendNotificationToReceiver,
  sendNotificationToAllUserOfARole,
  readAllNotifications,
  getAllNotificationsFromDB,
  getNotificationById,
};
