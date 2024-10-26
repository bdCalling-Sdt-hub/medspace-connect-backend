import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { ISubscriber, SubscriberModel } from './subscriber.interface';

const subscriberSchema = new Schema<ISubscriber, SubscriberModel>(
  {
    email: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

subscriberSchema.pre('save', async function (next) {
  const isExistSubscriber = await Subscriber.findOne({
    email: this.email,
  });
  if (isExistSubscriber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscriber already exists!');
  }
  const isExistUser = await User.findOne({
    email: this.email,
  });
  if (isExistUser) {
    this.user = isExistUser._id;
  }
  next();
});

export const Subscriber = model<ISubscriber, SubscriberModel>(
  'Subscriber',
  subscriberSchema
);
