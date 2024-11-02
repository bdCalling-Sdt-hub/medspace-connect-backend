import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { FavouriteService } from './favourite.service';

const createFavourite = catchAsync(async (req: Request, res: Response) => {
  const data = {
    userId: req.user?.id,
    ...req.body,
  };
  const result = await FavouriteService.createFavourite(data);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourite created successfully',
    data: result,
  });
});
const getAllFavourites = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.getAllFavourites();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourites fetched successfully',
    data: result,
  });
});
const getFavouriteById = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.getFavouriteById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourite fetched successfully',
    data: result,
  });
});
const updateFavourite = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.updateFavourite(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourite updated successfully',
    data: result,
  });
});
const deleteFavourite = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.deleteFavourite(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourite deleted successfully',
    data: result,
  });
});
const getFavouriteByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.getFavouriteByUserId(req.user?.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourites fetched successfully',
    data: result,
  });
});
export const FavouriteController = {
  createFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouriteByUserId,
};
