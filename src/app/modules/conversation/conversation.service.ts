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
  io.emit(`conversations::${newConversation._id}`, fullMessageData);
  await NotificationService.sendNotificationToReceiver(
    {
      title: 'A User is interested in your space',
      message: `${spaceSeeker.name} is interested in your space ${space.title}`,
      receiverId: space.providerId,
      type: 'normal',
      data: {
        conversationId: newConversation._id,
        post: space,
      },
    },
    io
  );
  await NotificationService.sendNotificationToAllUserOfARole(
    {
      title: 'A new conversation started',
      message: `${spaceSeeker.name} is interested space ${space.title}`,
      type: 'normal',
      data: {
        conversationId: newConversation._id,
        post: space,
      },
    },
    USER_ROLES.ADMIN,
    io
  );
  const conversationData = await Conversation.findById(newConversation._id);
  const provider = await User.findById(space.providerId);
  const finalConversationData = {
    profile: provider?.profile || '/profiles/default.png',
    name: provider?.name || 'Unknown',
    occupation: provider?.occupation || 'Unknown',
    //@ts-ignore
    conversationStarted: conversationData?.createdAt,
    conversationId: conversationData?._id,
  };
  io.emit(
    `new_conversation::${space.providerId}`,
    JSON.stringify(finalConversationData)
  );
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

  await io.emit(`new_message::${conversationId}`, newMessage);
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

  return updatedMessages;
};

const getUserConversations = async (userId: string): Promise<any> => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const conversations = await Conversation.find({
    $or: [{ spaceSeeker: userId }, { spaceProvider: userId }],
  }).sort({ createdAt: -1 });
  let finalResult: any = [];
  await Promise.all(
    conversations.map(async conversation => {
      if (isExistUser.role === USER_ROLES.SPACESEEKER) {
        const isExistProvider = await User.findById(conversation.spaceProvider);
        finalResult.push({
          profile: isExistProvider?.profile || '/profiles/default.png',
          name: isExistProvider?.name || 'Unknown',
          occupation: isExistProvider?.occupation || 'Unknown',
          //@ts-ignore
          conversationStarted: conversation.createdAt,
          conversationId: conversation._id,
        });
      } else {
        const isExistSeeker = await User.findById(conversation.spaceSeeker);
        finalResult.push({
          profile: isExistSeeker?.profile || '/profiles/default.png',
          name: isExistSeeker?.name || 'Unknown',
          occupation: isExistSeeker?.occupation || 'Unknown',
          //@ts-ignore
          conversationStarted: conversation.createdAt,
          conversationId: conversation._id,
        });
      }
    })
  );
  return finalResult;
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
  let messages: any;
  if (query) {
    messages = await Message.find({
      conversationID: conversationId,
      $text: { $search: query },
    }).sort({ score: { $meta: 'textScore' } });
  } else {
    messages = await Message.find({
      conversationID: conversationId,
    });
  }

  return messages;
};

const getAllConversationStatus = async (): Promise<any[]> => {
  const conversations = await Conversation.find({}).populate(
    'spaceId spaceSeeker spaceProvider'
  );
  const returnData: any[] = conversations.map((conversation: any) => ({
    owner: {
      id: conversation.spaceProvider._id,
      name: conversation.spaceProvider.name,
      profilePicture: conversation.spaceProvider.profile,
    },
    space: {
      id: conversation.spaceId._id,
      postTitle: conversation.spaceId.title,
      practiceType: conversation.spaceId.practiceFor,
      openingDate: conversation.spaceId.openingDate,
      price: conversation.spaceId.price,
    },
    spaceSeeker: {
      id: conversation.spaceSeeker._id,
      name: conversation.spaceSeeker.name,
      profilePicture: conversation.spaceSeeker.profile,
    },
  }));
  return returnData;
};

const getMonthlyConversationStatus = async (year: number): Promise<any[]> => {
  const months = [
    { name: 'Jan', conversations: 0 },
    { name: 'Feb', conversations: 0 },
    { name: 'Mar', conversations: 0 },
    { name: 'Apr', conversations: 0 },
    { name: 'May', conversations: 0 },
    { name: 'Jun', conversations: 0 },
    { name: 'Jul', conversations: 0 },
    { name: 'Aug', conversations: 0 },
    { name: 'Sep', conversations: 0 },
    { name: 'Oct', conversations: 0 },
    { name: 'Nov', conversations: 0 },
    { name: 'Dec', conversations: 0 },
  ];

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const monthlyConversation = await Conversation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Use Promise.all with map instead of forEach
  await Promise.all(
    monthlyConversation.map(async (conversation: any) => {
      const monthIndex = conversation._id - 1;

      // Initialize price if not already initialized
      //@ts-ignore
      months[monthIndex].totalEarnings = 0;

      months[monthIndex].conversations = conversation.count;
      const conversationsForMonth = await Conversation.find({
        createdAt: {
          $gte: new Date(year, monthIndex, 1),
          $lt: new Date(year, monthIndex + 1, 1),
        },
      }).populate('spaceId');
      // //@ts-ignore
      // months[monthIndex].space = conversationsForMonth[0]?.spaceId;
      //@ts-ignore
      months[monthIndex].totalEarnings = conversationsForMonth.reduce(
        (total: number, earning: any) => {
          return total + (earning.spaceId?.price || 0);
        },
        0
      );
    })
  );

  return months;
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
  getMonthlyConversationStatus,
  getAllConversationStatus,
};
