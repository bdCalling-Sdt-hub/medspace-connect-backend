import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Faq } from './faq.model';
import { IFaq } from './faq.interface';

const createFaq = async (payload: IFaq): Promise<IFaq> => {
  const result = await Faq.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create faq!');
  }
  return result;
};

const getAllFaqs = async (): Promise<IFaq[]> => {
  const result = await Faq.find();
  return result;
};
const getFaqById = async (id: string): Promise<IFaq | null> => {
  const result = await Faq.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq not found!');
  }
  return result;
};

const updateFaq = async (id: string, payload: IFaq): Promise<IFaq | null> => {
  const isExist = await Faq.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq not found!');
  }
  const result = await Faq.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update faq!');
  }
  return result;
};

const deleteFaq = async (id: string): Promise<IFaq | null> => {
  const result = await Faq.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete faq!');
  }
  return result;
};

export const FaqService = {
  createFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
};
