import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { chatNamespace } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import { kafkaHelper } from './helpers/kafkaHelper';
import { startMessageConsumer } from './workers/messageConsumer';
import { startMessageReadConsumer } from './workers/messageReadConsumer';
import { startNotificationConsumer } from './workers/notificationConsumer';

//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    await kafkaHelper.connect();
    logger.info(colors.green('🚀 Kafka connected successfully'));

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`)
      );
    });

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    chatNamespace(io);
    app.set('io', io);

    // Start Kafka consumers
    startMessageConsumer(io);
    startMessageReadConsumer(io);
    startNotificationConsumer(io);
  } catch (error) {
    errorLogger.error(
      colors.red('🤢 Failed to connect to Database or Kafka'),
      error
    );
    process.exit(1);
  }

  //handle unhandleRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
