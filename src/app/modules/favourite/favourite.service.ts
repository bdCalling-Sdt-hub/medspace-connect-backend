import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Favourite } from './favourite.model';
import { IFavourite } from './favourite.interface';
import { ObjectId, Types } from 'mongoose';
import { populate } from 'dotenv';

const createFavourite = async (
  payload: IFavourite
): Promise<IFavourite | null> => {
  const isExist = await Favourite.findOne({
    spaceId: payload.spaceId,
    userId: payload.userId,
  });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Favourite already exists');
  }
  const result = await Favourite.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create favourite');
  }
  return result;
};

const getAllFavourites = async (): Promise<IFavourite[] | null> => {
  const result: any = await Favourite.find();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favourites not found');
  }
  return result;
};

const getFavouriteById = async (id: string): Promise<IFavourite | null> => {
  const result = await Favourite.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favourite not found');
  }
  return result;
};
const updateFavourite = async (
  id: string,
  payload: Partial<IFavourite>
): Promise<IFavourite | null> => {
  const result = await Favourite.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update favourite');
  }
  return result;
};
const deleteFavouriteToDB = async (id: any): Promise<IFavourite | null> => {
  console.log(id);

  const result = await Favourite.findOneAndDelete({ spaceId: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete favourite');
  }
  return result;
};
const getFavouriteByUserId = async (
  userId: string
): Promise<IFavourite[] | null> => {
  const result: any = await Favourite.find({ userId }).populate({
    path: 'spaceId',
    populate: { path: 'providerId' },
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favourites not found');
  }
  return result;
};
export const FavouriteService = {
  createFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavouriteToDB,
  getFavouriteByUserId,
};
