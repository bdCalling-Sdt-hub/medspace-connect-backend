import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PracticeNeedService } from './practiceNeed.service';

const createPracticeNeed = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeNeedService.createPracticeNeed(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'PracticeNeed created successfully',
    data: result,
  });
});

const getAllPracticeNeeds = catchAsync(async (req: Request, res: Response) => {
  const search: any = req.query.search || '';
  const page = req.query.page || null;
  const limit = req.query.limit || null;

  const result = await PracticeNeedService.getAllPracticeNeeds(search as string, page as number | null, limit as number | null);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeNeeds fetched successfully',
    data: result,
  });
});

const getPracticeNeedById = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeNeedService.getPracticeNeedById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeNeed fetched successfully',
    data: result,
  });
});

const updatePracticeNeed = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeNeedService.updatePracticeNeed(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeNeed updated successfully',
    data: result,
  });
});

const deletePracticeNeed = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeNeedService.deletePracticeNeed(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeNeed deleted successfully',
    data: result,
  });
});

export const PracticeNeedController = {
  createPracticeNeed,
  getAllPracticeNeeds,
  getPracticeNeedById,
  updatePracticeNeed,
  deletePracticeNeed,
};
