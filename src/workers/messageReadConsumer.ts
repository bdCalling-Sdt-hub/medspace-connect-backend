import { kafkaHelper } from '../helpers/kafkaHelper';
import { Server } from 'socket.io';
import { logger, errorLogger } from '../shared/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const startMessageReadConsumer = async (io: Server) => {
  let retries = 0;

  const startConsumer = async () => {
    try {
      await kafkaHelper.messageReadConsumer.subscribe({
        topic: 'messages-read',
        fromBeginning: true,
      });

      await kafkaHelper.messageReadConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const messageData = JSON.parse(message.value.toString());
            logger.info(
              `Received message-read event from Kafka: ${JSON.stringify(
                messageData
              )}`
            );
            io.to(messageData.conversationId).emit('messages_read', {
              userId: messageData.userId,
            });
          }
        },
      });

      logger.info('Kafka message-read consumer started successfully');
    } catch (error) {
      errorLogger.error('Error starting Kafka message-read consumer', error);

      if (retries < MAX_RETRIES) {
        retries++;
        logger.info(
          `Retrying to start Kafka message-read consumer in ${
            RETRY_INTERVAL / 1000
          } seconds...`
        );
        setTimeout(startConsumer, RETRY_INTERVAL);
      } else {
        errorLogger.error(
          'Max retries reached. Failed to start Kafka message-read consumer.'
        );
      }
    }
  };

  startConsumer();
};
