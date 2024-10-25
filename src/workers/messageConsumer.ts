import { kafkaHelper } from '../helpers/kafkaHelper';
import { Server } from 'socket.io';
import { logger, errorLogger } from '../shared/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const startMessageConsumer = async (io: Server) => {
  let retries = 0;

  const startConsumer = async () => {
    try {
      await kafkaHelper.newMessageConsumer.subscribe({
        topic: 'new-messages',
        fromBeginning: true,
      });

      await kafkaHelper.newMessageConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const messageData = JSON.parse(message.value.toString());
            logger.info(
              `Received message from Kafka: ${JSON.stringify(messageData)}`
            );
            io.to(messageData.conversationID).emit('new_message', messageData);
          }
        },
      });

      logger.info('Kafka new message consumer started successfully');
    } catch (error) {
      errorLogger.error('Error starting Kafka new message consumer', error);

      if (retries < MAX_RETRIES) {
        retries++;
        logger.info(
          `Retrying to start Kafka new message consumer in ${
            RETRY_INTERVAL / 1000
          } seconds...`
        );
        setTimeout(startConsumer, RETRY_INTERVAL);
      } else {
        errorLogger.error(
          'Max retries reached. Failed to start Kafka new message consumer.'
        );
      }
    }
  };

  startConsumer();
};
