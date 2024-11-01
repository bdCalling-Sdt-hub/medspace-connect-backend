import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { SupportItem } from './supportItem.model';
import { ISupportItem } from './supportItem.interface';

const createSupportItemServiceFunction = async (
  payload: ISupportItem
): Promise<ISupportItem> => {
  console.log(payload);
  const result = await SupportItem.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create support item'
    );
  }
  return result;
};
const getAllSupportItemServiceFunction = async (): Promise<ISupportItem[]> => {
  const result = await SupportItem.find();
  return result;
};
const getSupportItemByIdServiceFunction = async (
  id: string
): Promise<ISupportItem | null> => {
  const result = await SupportItem.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support item not found');
  }
  return result;
};
const updateSupportItemByIdServiceFunction = async (
  id: string,
  payload: ISupportItem
): Promise<ISupportItem | null> => {
  const isExist = await SupportItem.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support item not found');
  }
  const result = await SupportItem.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support item not found');
  }
  return result;
};
const deleteSupportItemByIdServiceFunction = async (
  id: string
): Promise<ISupportItem | null> => {
  const isExist = await SupportItem.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support item not found');
  }
  const result = await SupportItem.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support item not found');
  }
  return result;
};
export const SupportItemService = {
  createSupportItemServiceFunction,
  getAllSupportItemServiceFunction,
  getSupportItemByIdServiceFunction,
  updateSupportItemByIdServiceFunction,
  deleteSupportItemByIdServiceFunction,
};
