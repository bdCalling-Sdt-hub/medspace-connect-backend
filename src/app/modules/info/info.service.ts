import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Info } from './info.model';

const createInfoToDB = async (payload: any) => {
  const result = await Info.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create info');
  }
  return result;
};

const updateInfoToDB = async (id: string, payload: any) => {
  const result = await Info.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update info');
  }
  return result;
};

const deleteInfoToDB = async (id: string) => {
  const result = await Info.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete info');
  }
  return result;
};

const getAllInfoFromDB = async () => {
  const result = await Info.find();
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get all info');
  }
  return result;
};
const getSingleInfoFromDB = async (id: string) => {
  const result = await Info.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get single info');
  }
  return result;
};
const getInfoByNameFromDB = async (name: string) => {
  const result = await Info.findOne({ name });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get info by name');
  }
  return result;
};
export const InfoService = {
  createInfoToDB,
  updateInfoToDB,
  deleteInfoToDB,
  getAllInfoFromDB,
  getSingleInfoFromDB,
  getInfoByNameFromDB,
};
