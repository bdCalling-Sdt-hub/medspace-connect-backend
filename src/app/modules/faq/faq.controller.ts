import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IFaq } from './faq.interface';
import { FaqService } from './faq.service';
import { StatusCodes } from 'http-status-codes';

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const { ...payload } = req.body;
  const result = await FaqService.createFaq(payload);
  sendResponse<IFaq>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq created successfully',
    data: result,
  });
});

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.getAllFaqs();
  sendResponse<IFaq[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faqs fetched successfully',
    data: result,
  });
});

const getFaqById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.getFaqById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq fetched successfully',
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...payload } = req.body;
  const result = await FaqService.updateFaq(id, payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq updated successfully',
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.deleteFaq(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq deleted successfully',
    data: result,
  });
});

export const FaqController = {
  createFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
};
