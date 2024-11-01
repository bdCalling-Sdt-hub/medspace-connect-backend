import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ConversationService } from './conversation.service';
import ApiError from '../../../errors/ApiError';
import { Server } from 'socket.io';
import { NotificationService } from '../notifications/notification.service';
import { Types } from 'mongoose';
import { kafkaHelper } from '../../../helpers/kafkaHelper';
import { IMessage } from './message/message.interface';

const startConversation = catchAsync(async (req: Request, res: Response) => {
  const { spaceId } = req.body;

  const userId = req.user.id;
  const io: Server = req.app.get('io');
  if (!spaceId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'spaceId is required');
  }

  const result = await ConversationService.startConversation(
    userId,
    spaceId,
    io
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Conversation started successfully',
    data: result,
  });
});

const addMessage = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { content, contentType } = req.body;
  const userId = req.user.id;

  const result = await ConversationService.addMessage(
    conversationId,
    userId,
    content,
    contentType
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message added successfully',
    data: result,
  });
});

const getConversation = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  const result = await ConversationService.getConversation(
    conversationId,
    userId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Conversation retrieved successfully',
    data: result,
  });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  const io: Server = req.app.get('io');

  let mediaFiles: string[] = [];
  if (req.files && 'messageFiles' in req.files) {
    mediaFiles = (req.files.messageFiles as Express.Multer.File[]).map(
      file => `/messageFiles/${file.filename}`
    );
  }

  const result = await ConversationService.sendMessageToDB(
    conversationId,
    userId,
    message,
    io,
    mediaFiles
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  const io: Server = req.app.get('io');

  const result = await ConversationService.markMessagesAsRead(
    conversationId,
    userId,
    io
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages marked as read successfully',
    data: result,
  });
});

const getUserConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await ConversationService.getUserConversations(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User conversations retrieved successfully',
    data: result,
  });
});

const deleteConversation = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  await ConversationService.deleteConversation(conversationId, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Conversation deleted successfully',
  });
});

// const updateConversationStatus = catchAsync(
//   async (req: Request, res: Response) => {
//     const { conversationId } = req.params;
//     const { isActive } = req.body;
//     const userId = req.user.id;
//     const result = await ConversationService.updateConversationStatus(
//       conversationId,
//       userId,
//       isActive
//     );
//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       success: true,
//       message: 'Conversation status updated successfully',
//       data: result,
//     });
//   }
// );

const getUnreadMessageCount = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await ConversationService.getUnreadMessageCount(userId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Unread message count retrieved successfully',
      data: result,
    });
  }
);

const searchMessages = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { query } = req.query;
  const userId = req.user.id;
  const result = await ConversationService.searchMessages(
    conversationId,
    userId,
    query as string
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages searched successfully',
    data: result,
  });
});

const getAllConversationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ConversationService.getAllConversationStatus();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'All conversation status retrieved successfully',
      data: result,
    });
  }
);

export const ConversationController = {
  startConversation,
  addMessage,
  getConversation,
  sendMessage,
  markMessagesAsRead,
  getUserConversations,
  deleteConversation,
  // updateConversationStatus,
  getUnreadMessageCount,
  searchMessages,
  getAllConversationStatus,
};
