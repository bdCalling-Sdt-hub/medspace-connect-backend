import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Favourite } from './favourite.model';
import { IFavourite } from './favourite.interface';

const createFavourite = async (
  payload: IFavourite
): Promise<IFavourite | null> => {
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
  const isExist = await Favourite.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favourite not found');
  }
  if (isExist.userId !== payload.userId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not authorized to update this favourite'
    );
  }
  const result = await Favourite.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update favourite');
  }
  return result;
};
const deleteFavourite = async (id: string): Promise<IFavourite | null> => {
  const result = await Favourite.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete favourite');
  }
  return result;
};
const getFavouriteByUserId = async (
  userId: string
): Promise<IFavourite[] | null> => {
  const result = await Favourite.find({ userId });
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
  deleteFavourite,
  getFavouriteByUserId,
};
