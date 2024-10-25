import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ConversationService } from './conversation.service';
import ApiError from '../../../errors/ApiError';
import { Server } from 'socket.io';

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

export const ConversationController = {
  startConversation,
  addMessage,
  getConversation,
  sendMessage,
  markMessagesAsRead,
};
