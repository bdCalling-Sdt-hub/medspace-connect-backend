import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';
import { kafkaHelper } from '../../../helpers/kafkaHelper';
import { sendMulticastPushNotification } from '../../../helpers/firebaseNotificationHelper';
import { firebaseAdmin } from '../../../firbase/firebase.config';
import { errorLogger, logger } from '../../../shared/logger';
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

  // Get user's device tokens
  const user = await User.findById(notification.receiverId);
  if (user?.deviceTokens?.length) {
    // Use multicast for better performance
    await sendMulticastPushNotification(
      user.deviceTokens,
      {
        title: notification.title,
        body: notification.message,
        data: {
          type: notification.type || 'normal',
          ...(notification.data || {}),
        },
      },
      notification.receiverId.toString()
    );
  }

  // Existing Kafka logic
  await kafkaHelper.producer.send({
    topic: 'notifications',
    messages: [{ value: JSON.stringify(result) }],
  });

  return result;
};
const getAllNotificationsFromDB = async (
  receiverId: string
): Promise<INotification[]> => {
  const result = await Notification.find({ receiverId });
  return result;
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

  // Get all users with their device tokens
  const users = await User.find({ role }, '_id deviceTokens');
  const notifications = users.map(user => ({
    ...notification,
    receiverId: user._id,
  }));

  const result = await Notification.insertMany(notifications);
  // Send push notifications in batches
  const batchSize = 500; // FCM limits to 500 tokens per request
  const usersWithTokens = users.filter(
    user => (user.deviceTokens || []).length > 0
  );

  for (let i = 0; i < usersWithTokens.length; i += batchSize) {
    const batch = usersWithTokens.slice(i, i + batchSize);
    const tokenGroups = batch.map(user => ({
      tokens: user.deviceTokens || [],
      userId: user._id.toString(),
    }));

    await Promise.all(
      tokenGroups.map(({ tokens, userId }) =>
        sendMulticastPushNotification(
          tokens,
          {
            title: notification.title,
            body: notification.message,
            data: {
              type: notification.type || 'normal',
              ...(notification.data || {}),
            },
          },
          userId
        )
      )
    );
  }

  // Publish notifications to Kafka in batches
  for (let i = 0; i < result.length; i += 100) {
    const batch = result.slice(i, i + 100);
    await kafkaHelper.producer.send({
      topic: 'notifications',
      messages: batch.map(notif => ({ value: JSON.stringify(notif) })),
    });
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
