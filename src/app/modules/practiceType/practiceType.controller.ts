import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PracticeTypeService } from './practiceType.service';

const createPracticeType = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeTypeService.createPracticeType(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'PracticeType created successfully',
    data: result,
  });
});

const getAllPracticeTypes = catchAsync(async (req: Request, res: Response) => {
  const search: any = req.query.search || '';
  const page = req.query.page || null;
  const limit = req.query.limit || null;

  const result = await PracticeTypeService.getAllPracticeTypes(search as string, page as number | null, limit as number | null);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeTypes fetched successfully',
    data: result,
  });
});

const getPracticeTypeById = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeTypeService.getPracticeTypeById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeType fetched successfully',
    data: result,
  });
});

const updatePracticeType = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeTypeService.updatePracticeType(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeType updated successfully',
    data: result,
  });
});

const deletePracticeType = catchAsync(async (req: Request, res: Response) => {
  const result = await PracticeTypeService.deletePracticeType(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'PracticeType deleted successfully',
    data: result,
  });
});

export const PracticeTypeController = {
  createPracticeType,
  getAllPracticeTypes,
  getPracticeTypeById,
  updatePracticeType,
  deletePracticeType,
};
