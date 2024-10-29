import { firebaseAdmin } from '../firbase/firebase.config';
import { logger, errorLogger } from '../shared/logger';
import { User } from '../app/modules/user/user.model';

export const sendPushNotification = async (
  deviceToken: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  },
  userId: string
): Promise<any> => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token: deviceToken,
    };

    const response = await firebaseAdmin.messaging().send(message);
    logger.info(`Successfully sent notification: ${response}`);
    return response;
  } catch (error: any) {
    errorLogger.error('Error sending push notification:', error);

    // Handle invalid token
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      await User.findByIdAndUpdate(userId, {
        $pull: { deviceTokens: deviceToken },
      });
      logger.info(`Removed invalid token ${deviceToken} for user ${userId}`);
    }

    throw error;
  }
};

export const sendMulticastPushNotification = async (
  deviceTokens: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  },
  userId: string
) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: deviceTokens,
    };

    const response = await firebaseAdmin.messaging().sendMulticast(message);
    logger.info(`Successfully sent ${response.successCount} messages`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (!resp.success ? deviceTokens[idx] : null))
        .filter(token => token !== null);

      if (failedTokens.length) {
        errorLogger.error(`Failed tokens: ${failedTokens.join(', ')}`);
        await User.findByIdAndUpdate(userId, {
          $pull: { deviceTokens: { $in: failedTokens } },
        });
      }
    }

    return response;
  } catch (error) {
    errorLogger.error('Error sending multicast push notification:', error);
    throw error;
  }
};

export const subscribeToTopic = async (deviceToken: string, topic: string) => {
  try {
    await firebaseAdmin.messaging().subscribeToTopic(deviceToken, topic);
    logger.info(`Device ${deviceToken} subscribed to topic ${topic}`);
  } catch (error) {
    errorLogger.error('Error subscribing to topic:', error);
    throw error;
  }
};

export const sendTopicNotification = async (
  topic: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      topic,
    };

    const response = await firebaseAdmin.messaging().send(message);
    logger.info(`Successfully sent topic notification: ${response}`);
    return response;
  } catch (error) {
    errorLogger.error('Error sending topic notification:', error);
    throw error;
  }
};

export const updateDeviceToken = async (
  userId: string,
  oldToken: string,
  newToken: string
) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { deviceTokens: oldToken },
      $addToSet: { deviceTokens: newToken },
    });
    logger.info(`Updated device token for user ${userId}`);
  } catch (error) {
    errorLogger.error('Error updating device token:', error);
    throw error;
  }
};

export const sendNotificationToTopic = async (
  role: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) => {
  try {
    const message = {
      topic: `role_${role.toLowerCase()}`,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    const response = await firebaseAdmin.messaging().send(message);
    logger.info(`Successfully sent topic notification: ${response}`);
    return response;
  } catch (error) {
    errorLogger.error('Error sending topic notification:', error);
    throw error;
  }
};
