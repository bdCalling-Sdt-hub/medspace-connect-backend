import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { LinksService } from './links.service';

const createLinks = catchAsync(async (req: Request, res: Response) => {
  let icon: any;
  if (req.files && 'icon' in req.files && req.files.icon[0]) {
    icon = `/icons/${req.files.icon[0].filename}`;
  }
  const data = {
    ...req.body,
    icon,
  };
  const result = await LinksService.createLinks(data);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Links created successfully',
    data: result,
  });
});

const getAllLinkss = catchAsync(async (req: Request, res: Response) => {
  const result = await LinksService.getAllLinkss();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Linkss fetched successfully',
    data: result,
  });
});

const getLinksById = catchAsync(async (req: Request, res: Response) => {
  const result = await LinksService.getLinksById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Links fetched successfully',
    data: result,
  });
});

const updateLinks = catchAsync(async (req: Request, res: Response) => {
  let icon: any = null;
  if (req.files && 'icon' in req.files && req.files.icon[0]) {
    icon = `/icons/${req.files.icon[0].filename}`;
  }
  const data = {
    ...req.body,
    icon,
  };
  const result = await LinksService.updateLinks(req.params.id, data);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Links updated successfully',
    data: result,
  });
});

const deleteLinks = catchAsync(async (req: Request, res: Response) => {
  const result = await LinksService.deleteLinks(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Links deleted successfully',
    data: result,
  });
});

export const LinksController = {
  createLinks,
  getAllLinkss,
  getLinksById,
  updateLinks,
  deleteLinks,
};
