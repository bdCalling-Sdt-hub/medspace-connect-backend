import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';
import { ConversationService } from '../app/modules/conversation/conversation.service';

const chatNamespace = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info('A user connected to chat');

    socket.on('join_conversation', async ({ conversationId, userId }) => {
      socket.join(`conversation::${conversationId}`);
      logger.info(`User ${userId} joined conversation: ${conversationId}`);
      logger.info(`Current rooms for socket: ${JSON.stringify(socket.rooms)}`);

      // Mark all unread messages as read
      await ConversationService.markMessagesAsRead(conversationId, userId, io);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation::${conversationId}`);
      logger.info(`User left conversation: ${conversationId}`);
    });

    socket.on('mark_messages_read', ({ conversationId, userId }) => {
      socket
        .to(`conversation::${conversationId}`)
        .emit('messages_read', { userId });
    });

    socket.on('disconnect', () => {
      logger.info('A user disconnected from chat');
    });
  });
};

export const socketHelper = { chatNamespace };
