import { Kafka } from 'kafkajs';
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
const consumer = kafka.consumer({ groupId: 'medspace-group' });

export const kafkaHelper = {
  producer,
  consumer,
  connect: async () => {
    await producer.connect();
    await consumer.connect();
  },
  disconnect: async () => {
    await producer.disconnect();
    await consumer.disconnect();
  },
};
