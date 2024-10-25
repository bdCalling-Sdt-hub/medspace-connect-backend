import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IConversation } from './conversation.interface';
import { Conversation } from './conversation.model';
import { Space } from '../space/space.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { Types, UpdateWriteOpResult } from 'mongoose';
import { Server } from 'socket.io';
import { IMessage } from './message/message.interface';
import { Message } from './message/message.model';
import { convertISOToHumanReadable } from '../../../shared/dateHelper';
import { kafkaHelper } from '../../../helpers/kafkaHelper';
import { NotificationService } from '../notifications/notification.service';
import { isUserViewingConversation } from '../../../helpers/socketHelper';

const startConversation = async (
  spaceSeekerUserId: string,
  spaceId: string,
  io: Server
): Promise<IConversation> => {
  const space = await Space.findById(spaceId);
  if (!space) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Space not found');
  }

  const spaceSeeker = await User.findOne({
    _id: spaceSeekerUserId,
    role: USER_ROLES.SPACESEEKER,
  });
  if (!spaceSeeker) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Space seeker not found');
  }

  const existingConversation = await Conversation.findOne({
    spaceSeeker: spaceSeekerUserId,
    spaceProvider: space.providerId,
    spaceId: spaceId,
  });

  if (existingConversation) {
    return existingConversation;
  }

  const newConversation = await Conversation.create({
    spaceSeeker: spaceSeekerUserId,
    spaceProvider: space.providerId,
    spaceId: spaceId,
    isActive: true,
  });
  if (!newConversation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to start conversation');
  }
  const currentDate = new Date();
  const humanReadableDate = convertISOToHumanReadable(
    currentDate.toISOString()
  );
  const fullMessageData: IMessage = {
    from: new Types.ObjectId(space.providerId),
    to: new Types.ObjectId(spaceSeekerUserId),
    conversationID: newConversation._id,
    spaceID: new Types.ObjectId(spaceId),
    message: `${spaceSeeker.name} is interested in talking to you about one of your post`,
    data: {
      post: space,
    },
    date: humanReadableDate,
  };
  io.emit(`conversation::${newConversation._id}`, fullMessageData);
  return newConversation;
};

const getConversation = async (
  conversationId: string,
  userId: string
): Promise<IConversation> => {
  const conversation: any = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }

  if (
    conversation.spaceSeeker.toString() !== userId &&
    conversation.spaceProvider.toString() !== userId
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
  }

  return conversation;
};

const addMessage = async (
  conversationId: string,
  senderId: string,
  message: string,
  mediaFiles: string[] = []
): Promise<any> => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }

  const newMessage: IMessage = {
    from: new Types.ObjectId(senderId),
    to: new Types.ObjectId(
      senderId === conversation.spaceSeeker.toString()
        ? conversation.spaceProvider.toString()
        : conversation.spaceSeeker.toString()
    ),
    conversationID: new Types.ObjectId(conversationId),
    spaceID: conversation.spaceId,
    message: message,
    status: 'unread',
    data: { mediaFiles },
    date: new Date().toISOString(),
  };

  const result = await Message.create(newMessage);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add message');
  }
  const messageData = await Message.findById(result._id).populate('from to');
  return messageData;
};

const sendMessageToDB = async (
  conversationId: string,
  senderId: string,
  message: string,
  io: Server,
  mediaFiles: string[] = []
): Promise<IMessage> => {
  const newMessage: any = await addMessage(
    conversationId,
    senderId,
    message,
    mediaFiles
  );

  // Publish message to Kafka
  await kafkaHelper.producer.send({
    topic: 'new-messages',
    messages: [{ value: JSON.stringify(newMessage) }],
  });

  // Check if the recipient is not currently viewing the conversation
  const recipientId = newMessage.to;
  if (!isUserViewingConversation(recipientId.toString(), conversationId)) {
    // Send notification
    await NotificationService.sendNotificationToReceiver(
      {
        receiverId: recipientId,
        title: 'New Message',
        message: `${newMessage.from.name} sent you a new message`,
        type: 'new_message',
        data: { conversationId, messageId: newMessage._id },
      },
      io
    );
  }

  return newMessage;
};

const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
  io: Server
): Promise<any> => {
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }

  const updatedMessages: any = await Message.updateMany(
    {
      conversationID: conversationId,
      to: userId,
      status: 'unread',
    },
    { status: 'read' }
  );

  if (updatedMessages.modifiedCount > 0) {
    // Publish to Kafka
    await kafkaHelper.producer.send({
      topic: 'messages-read',
      messages: [{ value: JSON.stringify({ conversationId, userId }) }],
    });

    // Clear notifications related to this conversation for this user
    await NotificationService.clearNotifications(userId, 'new_message', {
      conversationId,
    });
  }

  const allMessages = await Message.find({
    conversationID: conversationId,
    to: userId,
  });
  return allMessages;
};

const getUserConversations = async (
  userId: string
): Promise<IConversation[]> => {
  const conversations = await Conversation.find({
    $or: [{ spaceSeeker: userId }, { spaceProvider: userId }],
  }).populate('spaceId spaceSeeker spaceProvider');
  return conversations;
};

const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }
  await Conversation.findByIdAndDelete(conversationId);
  await Message.deleteMany({ conversationID: conversationId });
};

// const updateConversationStatus = async (
//   conversationId: string,
//   userId: string,
//   isActive: boolean
// ): Promise<IConversation> => {
//   const conversation = await getConversation(conversationId, userId);
//   if (!conversation) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
//   }
//   const updatedConversation = await Conversation.findByIdAndUpdate(
//     conversationId,
//     { isActive },
//     { new: true }
//   );
//   if (!updatedConversation) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to update conversation'
//     );
//   }
//   return updatedConversation;
// };

const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const count = await Message.countDocuments({
    to: userId,
    status: 'unread',
  });
  return count;
};

const searchMessages = async (
  conversationId: string,
  userId: string,
  query: string
): Promise<IMessage[]> => {
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }
  const messages = await Message.find({
    conversationID: conversationId,
    $text: { $search: query },
  }).sort({ score: { $meta: 'textScore' } });
  return messages;
};

export const ConversationService = {
  startConversation,
  addMessage,
  getConversation,
  sendMessageToDB,
  markMessagesAsRead,
  getUserConversations,
  deleteConversation,
  // updateConversationStatus,
  getUnreadMessageCount,
  searchMessages,
};
