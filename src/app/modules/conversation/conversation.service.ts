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
import { JwtPayload } from 'jsonwebtoken';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { UserService } from '../user/user.service';

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
    from: new Types.ObjectId(spaceSeekerUserId),
    to: new Types.ObjectId(space.providerId),
    conversationID: newConversation._id,
    spaceID: new Types.ObjectId(spaceId),
    message: `${spaceSeeker.name} is interested in talking to you about one of your post`,
    data: {
      mediaFiles: [space.spaceImages[0]],
    },
    //@ts-ignore
    date: newConversation.createdAt,
    //@ts-ignore
    createdAt: newConversation.createdAt,
  };
  await Message.create(fullMessageData);
  io.emit(`new_message::${newConversation._id}`, fullMessageData);
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
  await emailHelper.sendEmail(
    emailTemplate.aUserInterested(
      spaceSeeker.name,
      provider?.name!,
      provider?.email!,
      space.title,
      space.spaceImages[0]
    )
  );
  await NotificationService.sendNotificationToAllUserOfARole(
    {
      title: `${spaceSeeker.name} is interested in ${provider?.name}'s space.`,
      message: `${spaceSeeker.name} is interested in ${provider?.name}'s space ${space.title}`,
      data: {},
    },
    USER_ROLES.ADMIN,
    io
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
  const updateConversationStatus = await Conversation.findByIdAndUpdate(
    conversationId,
    { isRead: false },
    { new: true }
  );
  if (!updateConversationStatus) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update conversation'
    );
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
  const messageData = await Message.findById(result._id);
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
  const user = await User.findById(senderId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  await NotificationService.sendNotificationToReceiver(
    {
      title: 'New Message',
      message: `${user.name} sent you a new message`,
      receiverId: newMessage.to,
      data: { conversationId, messageId: newMessage._id },
    },
    io
  );
  // Check if the recipient is not currently viewing the conversation
  // const recipientId = newMessage.to;
  // if (!isUserViewingConversation(recipientId.toString(), conversationId)) {
  //   // Send notification
  //   await NotificationService.sendNotificationToReceiver(
  //     {
  //       receiverId: recipientId,
  //       title: 'New Message',
  //       message: `${newMessage.from.name} sent you a new message`,
  //       type: 'new_message',
  //       data: { conversationId, messageId: newMessage._id },
  //     },
  //     io
  //   );
  // }

  return newMessage;
};

const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
  io: Server
): Promise<any> => {
  console.log(conversationId, userId);
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
  }
  await Conversation.findByIdAndUpdate(conversationId, { isRead: true });

  const updatedMessages: any = await Message.updateMany(
    {
      $or: [{ to: userId, from: userId }],
      status: 'unread',
    },
    { status: 'read' }
  );

  return updatedMessages;
};

const getUserConversations = async (user: JwtPayload): Promise<any> => {
  const isExistUser = await User.findById(user.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const conversations = await Conversation.find({
    $or: [{ spaceSeeker: user.id }, { spaceProvider: user.id }],
  })
    .sort({ createdAt: -1 })
    .populate({
      path:
        user.role === USER_ROLES.SPACEPROVIDER
          ? 'spaceSeeker'
          : 'spaceProvider',
      select: 'name profile occupation',
    })
    .lean();
  const finalResult = await Promise.all(
    conversations.map(async conversation => {
      const lastMessage = await Message.find({
        conversationID: conversation._id,
      })
        .sort({ createdAt: -1 })
        .limit(1);
      const conversationUser =
        user.role === USER_ROLES.SPACEPROVIDER
          ? conversation.spaceSeeker
          : conversation.spaceProvider;
      return {
        // @ts-ignore
        profile: conversationUser.profile,
        // @ts-ignore
        name: conversationUser.name,
        // @ts-ignore
        occupation: conversationUser.occupation,
        conversationId: conversation._id.toString(),
        read: conversation.isRead,
        lastMessage: lastMessage[0] || null,
      };
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
  //@ts-ignore
  await Conversation.findByIdAndUpdate(conversation._id, {
    isRead: true,
  });
  await Message.updateMany(
    {
      conversationID: conversationId,
      to: userId,
      status: 'unread',
    },
    { status: 'read' }
  );
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
