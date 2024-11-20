import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { PracticeType } from './practiceType.model';
import { IPracticeType } from './practiceType.interface';

const createPracticeType = async (payload: IPracticeType): Promise<IPracticeType> => {
  const result = await PracticeType.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create practiceType!');
  }
  return result;
};

const getAllPracticeTypes = async (search: string, page: number | null, limit: number | null): Promise<IPracticeType[]> => {
  const query = search ? { $or: [{ type: { $regex: search, $options: 'i' } }] } : {};
  let queryBuilder = PracticeType.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};


const getPracticeTypeById = async (id: string): Promise<IPracticeType | null> => {
  const result = await PracticeType.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeType not found!');
  }
  return result;
};

const updatePracticeType = async (id: string, payload: IPracticeType): Promise<IPracticeType | null> => {
  const isExistPracticeType = await getPracticeTypeById(id);
  if (!isExistPracticeType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeType not found!');
  }
  const result = await PracticeType.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update practiceType!');
  }
  return result;
};

const deletePracticeType = async (id: string): Promise<IPracticeType | null> => {
  const isExistPracticeType = await getPracticeTypeById(id);
  if (!isExistPracticeType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeType not found!');
  }
  const result = await PracticeType.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete practiceType!');
  }
  return result;
};

export const PracticeTypeService = {
  createPracticeType,
  getAllPracticeTypes,
  getPracticeTypeById,
  updatePracticeType,
  deletePracticeType,
};
