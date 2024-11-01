import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { SpaceService } from './space.service';
import { SpaceValidation } from './space.validation';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../../../enums/user';

const createSpace = catchAsync(async (req: Request, res: Response) => {
  let spaceData = req.body.data;
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

  const result = await SpaceService.createSpaceToDB(data, id.toString());
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
  if (!req.user || req.user.role !== USER_ROLES.SPACEPROVIDER) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not authorized to update this space!'
    );
  }
  if (req.files && 'spaceImages' in req.files) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot update space images in this route!'
    );
  }
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
  const result = await SpaceService.filterSpacesFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Spaces fetched successfully',
    data: result,
  });
});
const getProviders = catchAsync(async (req: Request, res: Response) => {
  const result = await SpaceService.getProvidersFromDB();
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
export const SpaceController = {
  createSpace,
  updateSpace,
  updateSpaceImages,
  getSpaceById,
  addSpaceFacilities,
  removeSpaceFacilities,
  getAllSpaces,
  getSpaceStatus,
  filterSpaces,
  getProviders,
};
