import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { SpaceService } from './space.service';
import { SpaceValidation } from './space.validation';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../../../enums/user';
import { Server } from 'socket.io';

const createSpace = catchAsync(async (req: Request, res: Response) => {
  let spaceData = req.body.data;

  console.log(req);
  spaceData = await JSON.parse(spaceData);
  await SpaceValidation.createSpaceZodSchema.parseAsync(spaceData);
  const { id } = req.user;
  let spaceImages: string[] = [];
  if (req.files && 'spaceImages' in req.files) {
    spaceImages = (req.files.spaceImages as Express.Multer.File[]).map(
      file => `/spaceImages/${file.filename}`
    );
  }

  const data = {
    ...spaceData,
    providerId: id,
    spaceImages,
    facilities: Array.isArray(spaceData.facilities)
      ? spaceData.facilities
      : [spaceData.facilities],
  };
  const io: Server = req.app.get('io');
  const result = await SpaceService.createSpaceToDB(data, id.toString(), io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space created successfully',
    data: result,
  });
});

const updateSpace = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req.user.id;
  console.log(data);
  if (!req.user || req.user.role !== USER_ROLES.SPACEPROVIDER) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not authorized to update this space!'
    );
  }
  let addImages: string[] | null = null;
  if (req.files && 'addImages' in req.files) {
    addImages = (req.files.addImages as Express.Multer.File[]).map(
      file => `/spaceImages/${file.filename}`
    );
  }
  data.addImages = addImages;
  const result = await SpaceService.updateSpaceToDB(id, data, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space updated successfully',
    data: result,
  });
});
const updateSpaceImages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let spaceImages: string[] = [];
  if (req.files && 'spaceImages' in req.files) {
    spaceImages = (req.files.spaceImages as Express.Multer.File[]).map(
      file => `/spaceImages/${file.filename}`
    );
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'spaceImages are required!');
  }
  const userId = req.user.id;
  const result = await SpaceService.updateSpaceImagesToDB(
    id,
    spaceImages,
    userId
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space images updated successfully',
    data: result,
  });
});
const addSpaceFacilities = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: string | [string] = req.body.facilities;

  const result = await SpaceService.addSpaceFacilitiesToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space facilities updated successfully',
    data: result,
  });
});
const removeSpaceFacilities = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: string | [string] = req.body.facilities;
    const result = await SpaceService.removeSpaceFacilitiesToDB(id, data);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Space facilities removed successfully',
      data: result,
    });
  }
);
const getSpaceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpaceService.getSpaceByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space fetched successfully',
    data: result,
  });
});
const getAllSpaces = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
  };

  const result = await SpaceService.getAllSpacesFromDB(paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result.data,
    pagination: result.meta,
  });
});
const filterSpaces = catchAsync(async (req: Request, res: Response) => {
  console.log(req.query);
  const result = await SpaceService.searchAndFilterSpaces(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result,
  });
});
const getProviders = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await SpaceService.getProvidersFromDB(page, limit);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Providers fetched successfully',
    data: result,
  });
});
const getSpaceStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await SpaceService.getSpaceStatusFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Space status fetched successfully',
    data: result,
  });
});
const getMySpaces = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id.toString();
  const result = await SpaceService.getMySpacesFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result,
  });
});
const getRecentSpaces = catchAsync(async (req: Request, res: Response) => {
  const result = await SpaceService.getRecentSpacesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result,
  });
});
const getInterestedSpaces = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id.toString();
  const result = await SpaceService.getInterestedSpacesFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result,
  });
});

export const SpaceController = {
  createSpace,
  updateSpace,
  updateSpaceImages,
  getMySpaces,
  getInterestedSpaces,
  getSpaceById,
  addSpaceFacilities,
  removeSpaceFacilities,
  getAllSpaces,
  getSpaceStatus,
  getRecentSpaces,
  filterSpaces,
  getProviders,
};
