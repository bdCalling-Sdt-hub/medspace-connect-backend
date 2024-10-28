import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { About } from './about.model';
import { IAbout } from './about.interface';
import { AboutValidation } from './about.validation';
import unlinkFile from '../../../shared/unlinkFile';

const createAboutToDB = async (payload: IAbout): Promise<IAbout> => {
  await AboutValidation.createAboutZodSchema.parseAsync(payload);
  const result = await About.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create about');
  }
  return result;
};

const getAllAboutFromDB = async () => {
  const result = await About.find();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  return result;
};

const getSingleAboutFromDB = async (id: string) => {
  const result = await About.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  return result;
};
const updateAboutToDB = async (id: string, payload: IAbout) => {
  await AboutValidation.updateAboutZodSchema.parseAsync(payload);
  const about = await About.findById(id);
  if (!about) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  if (about.image) {
    await unlinkFile(about?.image);
  }
  const result = await About.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  return result;
};

const deleteAboutFromDB = async (id: string) => {
  const about = await About.findById(id);
  if (!about) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  if (about.image) {
    await unlinkFile(about?.image);
  }
  const result = await About.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'About not found');
  }
  return result;
};

export const AboutService = {
  createAboutToDB,
  getAllAboutFromDB,
  getSingleAboutFromDB,
  updateAboutToDB,
  deleteAboutFromDB,
};
