"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaHelper = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = __importDefault(require("../config"));
const kafka = new kafkajs_1.Kafka({
    clientId: 'medspace-connect',
    brokers: [config_1.default.kafka_broker || 'localhost:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8,
    },
});
const producer = kafka.producer();
const newMessageConsumer = kafka.consumer({ groupId: 'new-message-group' });
const messageReadConsumer = kafka.consumer({ groupId: 'message-read-group' });
const notificationConsumer = kafka.consumer({ groupId: 'notification-group' });
exports.kafkaHelper = {
    producer,
    newMessageConsumer,
    messageReadConsumer,
    notificationConsumer,
    connect: () => __awaiter(void 0, void 0, void 0, function* () {
        yield producer.connect();
        yield newMessageConsumer.connect();
        yield messageReadConsumer.connect();
        yield notificationConsumer.connect();
    }),
    disconnect: () => __awaiter(void 0, void 0, void 0, function* () {
        yield producer.disconnect();
        yield newMessageConsumer.disconnect();
        yield messageReadConsumer.disconnect();
        yield notificationConsumer.disconnect();
    }),
};
