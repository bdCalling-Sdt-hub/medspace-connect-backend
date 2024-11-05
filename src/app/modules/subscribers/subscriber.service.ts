import { ISubscriber } from './subscriber.interface';
import { Subscriber } from './subscriber.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { emailHelper } from '../../../helpers/emailHelper';
const createSubscriber = async (payload: ISubscriber) => {
  const result = await Subscriber.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create subscriber!');
  }
  return result;
};

const getAllSubscribers = async () => {
  const result = await Subscriber.find();
  return result;
};

const getSubscriberById = async (id: string) => {
  const result = await Subscriber.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscriber not found!');
  }
  return result;
};
const getSubscriberByEmail = async (email: string) => {
  const result = await Subscriber.findOne({ email });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscriber not found!');
  }
  return result;
};
const deleteSubscriber = async (id: string) => {
  const result = await Subscriber.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscriber not found!');
  }
  return result;
};
const sendEmailToDB = async (payload: ISubscriber) => {
  // emailHelper.sendEmail
  // return result;
};

export const SubscriberService = {
  createSubscriber,
  getAllSubscribers,
  sendEmailToDB,
  getSubscriberById,
  getSubscriberByEmail,
  deleteSubscriber,
};
