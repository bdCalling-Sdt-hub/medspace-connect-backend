import { Request, Response } from 'express';
import { SubscriberService } from './subscriber.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.createSubscriber(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Subscriber created successfully',
    data: result,
  });
});
const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.getAllSubscribers();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscribers fetched successfully',
    data: result,
  });
});

const getSubscriberById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriberService.getSubscriberById(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriber fetched successfully',
    data: result,
  });
});
const getSubscriberByEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.params;
  const result = await SubscriberService.getSubscriberByEmail(email);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriber fetched successfully',
    data: result,
  });
});
const deleteSubscriber = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriberService.deleteSubscriber(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriber deleted successfully',
    data: result,
  });
});
const sendEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriberService.sendEmailToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Email sent successfully',
    data: result,
  });
});

export const SubscriberController = {
  createSubscriber,
  getAllSubscribers,
  sendEmail,
  getSubscriberById,
  getSubscriberByEmail,
  deleteSubscriber,
};
