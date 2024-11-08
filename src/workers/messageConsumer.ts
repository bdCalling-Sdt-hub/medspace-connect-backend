import { kafkaHelper } from '../helpers/kafkaHelper';
import { Server } from 'socket.io';
import { logger, errorLogger } from '../shared/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds
const CONSUMER_GROUP_IDS = ['group-1', 'group-2', 'group-3'];
const MAX_BATCH_SIZE = 100;
const MAX_BATCH_BYTES = 1048576; // 1 MB
const BACKPRESSURE_THRESHOLD = 100;
const BACKPRESSURE_RELEASE_THRESHOLD = 50;

export const startMessageConsumer = async (io: Server) => {
  for (const groupId of CONSUMER_GROUP_IDS) {
    startConsumer(groupId, io);
  }
};

const startConsumer = async (groupId: string, io: Server) => {
  let retries = 0;
  let messageBuffer: any[] = [];
  let shouldPause = false;

  const startConsumerInternal = async () => {
    try {
      await kafkaHelper.newMessageConsumer.subscribe({
        topic: 'new-messages',
        fromBeginning: true,
        //@ts-ignore
        groupId: groupId,
        maxBatchSize: MAX_BATCH_SIZE,
        maxBatchBytes: MAX_BATCH_BYTES,
      });

      await kafkaHelper.newMessageConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const messageData = JSON.parse(message.value.toString());
            logger.info(
              `[${groupId}] Received message from Kafka: ${JSON.stringify(
                messageData
              )}`
            );

            if (!shouldPause) {
              await io.emit(
                `new_message::${messageData.conversationId as string}`,
                messageData
              );
            } else {
              logger.info('[BACKPRESSURE] Buffering message.');
              messageBuffer.push(messageData);
            }

            if (messageBuffer.length >= BACKPRESSURE_THRESHOLD) {
              shouldPause = true;
              logger.info(
                '[BACKPRESSURE] Applying backpressure. Pausing message consumption.'
              );
            }
          }
        },
      });

      logger.info(
        `[${groupId}] Kafka new message consumer started successfully`
      );
    } catch (error) {
      errorLogger.error(
        `[${groupId}] Error starting Kafka new message consumer`,
        error
      );

      if (retries < MAX_RETRIES) {
        retries++;
        logger.info(
          `[${groupId}] Retrying to start Kafka new message consumer in ${
            RETRY_INTERVAL / 1000
          } seconds...`
        );
        setTimeout(startConsumerInternal, RETRY_INTERVAL);
      } else {
        errorLogger.error(
          `[${groupId}] Max retries reached. Failed to start Kafka new message consumer.`
        );
      }
    }
  };

  startConsumerInternal();

  // Periodically check if the backpressure can be released
  setInterval(() => {
    if (messageBuffer.length < BACKPRESSURE_RELEASE_THRESHOLD) {
      shouldPause = false;
      logger.info(
        `[${groupId}] Releasing backpressure. Resuming message consumption.`
      );
      while (messageBuffer.length > 0) {
        const message = messageBuffer.shift();
        io.emit(`new_message::${message.conversationId as string}`, message);
      }
    }
  }, 1000);
};
