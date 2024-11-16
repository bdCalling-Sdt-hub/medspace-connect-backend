import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';

const sendNotificationToReceiver = async (
  notification: INotification,
  io: Server
): Promise<any> => {
  if (!notification.receiverId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Receiver ID is required!');
  }

  const result: any = await Notification.create(notification);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send notification!');
  }

  // Publish to Kafka - let the consumer handle Socket.IO notification
  io.emit(`new_notification::${result.receiverId.toString()}`, result);

  return result;
};

const getAllNotificationsFromDB = async (
  receiverId: string,
  role: string
): Promise<any> => {
  const result = await Notification.find({ receiverId }).sort({
    createdAt: -1,
  });
  const unreadCount = await Notification.countDocuments({
    receiverId,
    status: 'unread',
  });
  return { notifications: result, unreadCount };
};

const sendNotificationToAllUserOfARole = async (
  notification: INotification,
  role: string,
  io: Server
): Promise<any> => {
  if (
    role !== USER_ROLES.SPACEPROVIDER &&
    role !== USER_ROLES.SPACESEEKER &&
    role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid role for sending notification!'
    );
  }

  const users = await User.find({ role }, '_id');
  const notifications = users.map(user => ({
    ...notification,
    receiverId: user._id,
  }));

  const result = await Notification.insertMany(notifications);

  // Publish notifications to Socket.IO in batches
  const batchSize = 100;
  for (let i = 0; i < result.length; i += batchSize) {
    const batch = result.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (notification: any) => {
        io.emit(
          `new_notification::${notification.receiverId.toString()}`,
          notification
        );
      })
    );
  }

  return result;
};

const readAllNotifications = async (receiverId: string) => {
  const result = await Notification.updateMany(
    { receiverId },
    { status: 'read' }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to read notifications!'
    );
  }
  const notifications = await Notification.find({ receiverId });
  return notifications;
};

const clearNotifications = async (
  receiverId: string,
  type: string,
  data: any
) => {
  const result = await Notification.deleteMany({
    receiverId,
    type,
    'data.conversationId': data.conversationId,
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to clear notifications!'
    );
  }

  return result;
};

const getNotificationById = async (id: string) => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }
  return result;
};

export const NotificationService = {
  sendNotificationToReceiver,
  sendNotificationToAllUserOfARole,
  getAllNotificationsFromDB,
  readAllNotifications,
  clearNotifications,
  getNotificationById,
};
