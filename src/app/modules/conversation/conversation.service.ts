import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IConversation } from './conversation.interface';
import { Conversation } from './conversation.model';
import { Space } from '../space/space.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
import { Server } from 'socket.io';
import { IMessage } from './message/message.interface';
import { Message } from './message/message.model';
import { convertISOToHumanReadable } from '../../../shared/dateHelper';

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
  const conversation = await Conversation.findById(conversationId);
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
  content: string,
  contentType: 'text' | 'image' | 'video'
): Promise<IMessage> => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }

  if (
    conversation.spaceSeeker.toString() !== senderId &&
    conversation.spaceProvider.toString() !== senderId
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
  }
  const currentDate = new Date();
  const humanReadableDate = convertISOToHumanReadable(
    currentDate.toISOString()
  );
  const newMessage: IMessage = {
    from: new Types.ObjectId(senderId),
    to: new Types.ObjectId(senderId),
    conversationID: new Types.ObjectId(conversationId),
    spaceID: new Types.ObjectId(conversation.spaceId),
    message: content,
    data: {},
    date: humanReadableDate,
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
  content: string,
  contentType: 'text' | 'image' | 'video',
  io: Server
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

  const message = await addMessage(
    conversationId,
    senderId,
    content,
    contentType
  );
  if (!message) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add message');
  }
  io.emit(`conversation::${conversationId}`, message);
  return message;
};

export const ConversationService = {
  startConversation,
  addMessage,
  getConversation,
  sendMessageToDB,
};
