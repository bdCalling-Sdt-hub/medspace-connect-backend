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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationConsumer = void 0;
const kafkaHelper_1 = require("../helpers/kafkaHelper");
const logger_1 = require("../shared/logger");
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
const startNotificationConsumer = (io) => __awaiter(void 0, void 0, void 0, function* () {
    let retries = 0;
    const startConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield kafkaHelper_1.kafkaHelper.notificationConsumer.subscribe({
                topic: 'notifications',
                fromBeginning: true,
            });
            yield kafkaHelper_1.kafkaHelper.notificationConsumer.run({
                eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ topic, partition, message }) {
                    if (message.value) {
                        const notificationData = JSON.parse(message.value.toString());
                        logger_1.logger.info(`Received notification from Kafka: ${JSON.stringify(notificationData)}`);
                        // Emit to Socket.IO only
                        io.to(`user::${notificationData.receiverId}`).emit('new_notification', notificationData);
                    }
                }),
            });
            logger_1.logger.info('Kafka notification consumer started successfully');
        }
        catch (error) {
            logger_1.errorLogger.error('Error starting Kafka notification consumer', error);
            if (retries < MAX_RETRIES) {
                retries++;
                logger_1.logger.info(`Retrying to start Kafka notification consumer in ${RETRY_INTERVAL / 1000} seconds...`);
                setTimeout(startConsumer, RETRY_INTERVAL);
            }
            else {
                logger_1.errorLogger.error('Max retries reached. Failed to start Kafka notification consumer.');
            }
        }
    });
    startConsumer();
});
exports.startNotificationConsumer = startNotificationConsumer;
