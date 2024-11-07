import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { InfoService } from './info.service';

const createInfo = catchAsync(async (req: Request, res: Response) => {
  const { ...infoData } = req.body;
  const result = await InfoService.createInfoToDB(infoData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info created successfully',
    data: result,
  });
});

const getAllInfo = catchAsync(async (req: Request, res: Response) => {
  let result: any;
  if (req.query.name) {
    result = await InfoService.getInfoByNameFromDB(req.query.name as string);
  } else {
    result = await InfoService.getAllInfoFromDB();
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info fetched successfully',
    data: result,
  });
});

const getSingleInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InfoService.getSingleInfoFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info fetched successfully',
    data: result,
  });
});

const updateInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...infoData } = req.body;
  const result = await InfoService.updateInfoToDB(id, infoData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info updated successfully',
    data: result,
  });
});

const deleteInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InfoService.deleteInfoToDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info deleted successfully',
    data: result,
  });
});

const getInfoByName = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.params;
  const result = await InfoService.getInfoByNameFromDB(name);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info fetched successfully',
    data: result,
  });
});

export const InfoController = {
  createInfo,
  getAllInfo,
  getSingleInfo,
  updateInfo,
  deleteInfo,
  getInfoByName,
};
