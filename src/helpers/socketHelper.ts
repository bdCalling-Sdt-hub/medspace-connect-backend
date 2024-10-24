import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';

const chatNamespace = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info('A user connected to chat');

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation::${conversationId}`);
      logger.info(`User joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation::${conversationId}`);
      logger.info(`User left conversation: ${conversationId}`);
    });

    socket.on('disconnect', () => {
      logger.info('A user disconnected from chat');
    });
  });
};

export const socketHelper = { chatNamespace };
