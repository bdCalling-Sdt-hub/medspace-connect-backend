import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Links } from './links.model';
import { ILinks } from './links.interface';
import unlinkFile from '../../../shared/unlinkFile';

const createLinks = async (payload: ILinks): Promise<ILinks> => {
  const result = await Links.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create links!');
  }
  return result;
};

const getAllLinkss = async (): Promise<ILinks[]> => {
  return await Links.find();
};

const getLinksById = async (id: string): Promise<ILinks | null> => {
  const result = await Links.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Links not found!');
  }
  return result;
};

const updateLinks = async (
  id: string,
  payload: ILinks
): Promise<ILinks | null> => {
  const isExist = await Links.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Links not found!');
  }
  if (payload.icon === null) {
    payload.icon = isExist.icon;
  }
  unlinkFile(isExist.icon);
  const result = await Links.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update links!');
  }
  return result;
};

const deleteLinks = async (id: string): Promise<ILinks | null> => {
  const result = await Links.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete links!');
  }
  return result;
};

export const LinksService = {
  createLinks,
  getAllLinkss,
  getLinksById,
  updateLinks,
  deleteLinks,
};
