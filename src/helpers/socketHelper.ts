import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';
import { ConversationService } from '../app/modules/conversation/conversation.service';

const activeUsers = new Map<string, Set<string>>();

export const isUserViewingConversation = (
  userId: string,
  conversationId: string
) => {
  return activeUsers.get(userId)?.has(conversationId) || false;
};

const chatNamespace = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info('A user connected to chat');

    socket.on('join_conversation', async ({ conversationId, userId }) => {
      socket.join(conversationId);
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId)?.add(conversationId);
      logger.info(`User ${userId} joined conversation: ${conversationId}`);

      await ConversationService.markMessagesAsRead(conversationId, userId, io);
    });

    socket.on('leave_conversation', ({ userId, conversationId }) => {
      activeUsers.get(userId)?.delete(conversationId);
      if (activeUsers.get(userId)?.size === 0) {
        activeUsers.delete(userId);
      }
      logger.info(`User ${userId} left conversation ${conversationId}`);
    });

    socket.on('mark_messages_read', async ({ conversationId, userId }) => {
      await ConversationService.markMessagesAsRead(conversationId, userId, io);
    });

    socket.on('disconnect', () => {
      for (const [userId, conversations] of activeUsers.entries()) {
        if (
          Array.from(conversations).some(conversationId =>
            socket.rooms.has(conversationId)
          )
        ) {
          activeUsers.delete(userId);
          logger.info(`User ${userId} disconnected from chat`);
          break;
        }
      }
    });
  });
};

export { chatNamespace };
