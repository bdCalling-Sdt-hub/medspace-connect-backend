import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { About } from './about.model';
import { IAbout } from './about.interface';
import { AboutValidation } from './about.validation';

const createAbout = async (payload: IAbout) => {
  await AboutValidation.createAboutZodSchema.parseAsync(payload);
  const result = await About.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create about');
  }
  return result;
};

export const AboutService = { createAbout };
