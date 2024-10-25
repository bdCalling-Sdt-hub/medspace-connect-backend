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
): Promise<IMessage> => {
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

  return result;
};

const sendMessageToDB = async (
  conversationId: string,
  senderId: string,
  message: string,
  io: Server,
  mediaFiles: string[] = []
) => {
  const conversation = await getConversation(conversationId, senderId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }
  if (
    conversation.spaceProvider.toString() !== senderId &&
    conversation.spaceSeeker.toString() !== senderId
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
  }

  const newMessage = await addMessage(
    conversationId,
    senderId,
    message,
    mediaFiles
  );
  if (!newMessage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add message');
  }

  // Send message to Kafka
  await kafkaHelper.producer.send({
    topic: 'new-messages',
    messages: [{ value: JSON.stringify(newMessage) }],
  });

  // Emit the message directly via Socket.IO
  io.emit(`conversation::${conversationId}`, newMessage);

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

  const updatedMessages = await Message.updateMany(
    {
      conversationID: conversationId,
      to: userId,
      status: 'unread',
    },
    { status: 'read' }
  );

  if (updatedMessages.modifiedCount > 0) {
    io.to(`conversation::${conversationId}`).emit('messages_read', { userId });
  }
  const allMessages = await Message.find({
    conversationID: conversationId,
    to: userId,
  });
  return allMessages;
};

export const ConversationService = {
  startConversation,
  addMessage,
  getConversation,
  sendMessageToDB,
  markMessagesAsRead,
};
