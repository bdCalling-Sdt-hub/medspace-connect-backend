import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { PracticeNeed } from './practiceNeed.model';
import { IPracticeNeed } from './practiceNeed.interface';

const createPracticeNeed = async (payload: IPracticeNeed): Promise<IPracticeNeed> => {
  const result = await PracticeNeed.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create practiceNeed!');
  }
  return result;
};

const getAllPracticeNeeds = async (search: string, page: number | null, limit: number | null): Promise<IPracticeNeed[]> => {
  const query = search ? { $or: [{ need: { $regex: search, $options: 'i' } }] } : {};
  let queryBuilder = PracticeNeed.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};


const getPracticeNeedById = async (id: string): Promise<IPracticeNeed | null> => {
  const result = await PracticeNeed.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeNeed not found!');
  }
  return result;
};

const updatePracticeNeed = async (id: string, payload: IPracticeNeed): Promise<IPracticeNeed | null> => {
  const isExistPracticeNeed = await getPracticeNeedById(id);
  if (!isExistPracticeNeed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeNeed not found!');
  }
  const result = await PracticeNeed.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update practiceNeed!');
  }
  return result;
};

const deletePracticeNeed = async (id: string): Promise<IPracticeNeed | null> => {
  const isExistPracticeNeed = await getPracticeNeedById(id);
  if (!isExistPracticeNeed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'PracticeNeed not found!');
  }
  const result = await PracticeNeed.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete practiceNeed!');
  }
  return result;
};

export const PracticeNeedService = {
  createPracticeNeed,
  getAllPracticeNeeds,
  getPracticeNeedById,
  updatePracticeNeed,
  deletePracticeNeed,
};
