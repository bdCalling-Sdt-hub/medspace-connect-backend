import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AboutService } from './about.service';
import ApiError from '../../../errors/ApiError';
export const createAbout = catchAsync(async (req: Request, res: Response) => {
  let aboutImage: string;
  if (req.files && 'aboutImage' in req.files && req.files.aboutImage[0]) {
    aboutImage = `/aboutImages/${req.files.aboutImage[0].filename}`;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'aboutImage is required');
  }
  const result = await AboutService.createAbout({
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
export const AboutController = { createAbout };
