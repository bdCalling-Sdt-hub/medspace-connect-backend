import { kafkaHelper } from '../helpers/kafkaHelper';
import { Server } from 'socket.io';
import { logger, errorLogger } from '../shared/logger';
import { User } from '../app/modules/user/user.model';
import { sendMulticastPushNotification } from '../helpers/firebaseNotificationHelper';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

export const startNotificationConsumer = async (io: Server) => {
  let retries = 0;

  const startConsumer = async () => {
    try {
      await kafkaHelper.notificationConsumer.subscribe({
        topic: 'notifications',
        fromBeginning: true,
      });

      await kafkaHelper.notificationConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const notificationData = JSON.parse(message.value.toString());
            logger.info(
              `Received notification from Kafka: ${JSON.stringify(
                notificationData
              )}`
            );

            // Emit to Socket.IO
            io.to(`user::${notificationData.receiverId}`).emit(
              'new_notification',
              notificationData
            );

            // Send Push Notification
            try {
              const user = await User.findById(notificationData.receiverId);
              if (user?.deviceTokens?.length) {
                await sendMulticastPushNotification(
                  user.deviceTokens,
                  {
                    title: notificationData.title,
                    body: notificationData.message,
                    data: {
                      type: notificationData.type || 'normal',
                      ...(notificationData.data || {}),
                    },
                  },
                  notificationData.receiverId.toString()
                );
              }
            } catch (error) {
              errorLogger.error('Error sending push notification:', error);
            }
          }
        },
      });

      logger.info('Kafka notification consumer started successfully');
    } catch (error) {
      errorLogger.error('Error starting Kafka notification consumer', error);

      if (retries < MAX_RETRIES) {
        retries++;
        logger.info(
          `Retrying to start Kafka notification consumer in ${
            RETRY_INTERVAL / 1000
          } seconds...`
        );
        setTimeout(startConsumer, RETRY_INTERVAL);
      } else {
        errorLogger.error(
          'Max retries reached. Failed to start Kafka notification consumer.'
        );
      }
    }
  };

  startConsumer();
};
