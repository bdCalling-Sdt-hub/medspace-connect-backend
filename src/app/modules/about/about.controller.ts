import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AboutService } from './about.service';
import ApiError from '../../../errors/ApiError';
import { IAbout } from './about.interface';
export const createAbout = catchAsync(async (req: Request, res: Response) => {
  let aboutImage: string;
  if (req.files && 'aboutImage' in req.files && req.files.aboutImage[0]) {
    aboutImage = `/aboutImages/${req.files.aboutImage[0].filename}`;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'aboutImage is required');
  }
  const result = await AboutService.createAboutToDB({
    ...req.body,
    image: aboutImage,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About created successfully',
    data: result,
  });
});

const getAllAbout = catchAsync(async (req: Request, res: Response) => {
  const result: IAbout[] = await AboutService.getAllAboutFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About fetched successfully',
    data: result,
  });
});

const getSingleAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await AboutService.getSingleAboutFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About fetched successfully',
    data: result,
  });
});

const updateAbout = catchAsync(async (req: Request, res: Response) => {
  let aboutImage: string | null = null;
  const { ...aboutData } = req.body;
  if (req.files && 'aboutImage' in req.files && req.files.aboutImage[0]) {
    aboutImage = `/aboutImages/${req.files.aboutImage[0].filename}`;
  }
  if (aboutImage !== null) {
    aboutData.image = aboutImage;
  }

  const result = await AboutService.updateAboutToDB(req.params.id, aboutData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About updated successfully',
    data: result,
  });
});

const deleteAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await AboutService.deleteAboutFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'About deleted successfully',
    data: result,
  });
});
export const AboutController = {
  createAbout,
  getAllAbout,
  getSingleAbout,
  updateAbout,
  deleteAbout,
};
