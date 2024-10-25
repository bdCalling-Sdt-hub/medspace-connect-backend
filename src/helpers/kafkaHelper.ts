import { Kafka, Consumer } from 'kafkajs';
import config from '../config';

const kafka = new Kafka({
  clientId: 'medspace-connect',
  brokers: [config.kafka_broker || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

const producer = kafka.producer();
const newMessageConsumer = kafka.consumer({ groupId: 'new-message-group' });
const messageReadConsumer = kafka.consumer({ groupId: 'message-read-group' });
const notificationConsumer = kafka.consumer({ groupId: 'notification-group' });

export const kafkaHelper = {
  producer,
  newMessageConsumer,
  messageReadConsumer,
  notificationConsumer,
  connect: async () => {
    await producer.connect();
    await newMessageConsumer.connect();
    await messageReadConsumer.connect();
    await notificationConsumer.connect();
  },
  disconnect: async () => {
    await producer.disconnect();
    await newMessageConsumer.disconnect();
    await messageReadConsumer.disconnect();
    await notificationConsumer.disconnect();
  },
};
