import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { INotification, NotificationModel } from './notification.interface';

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    type: {
      type: String,
      enum: ['new_message', 'normal'],
      required: false,
      default: 'normal',
    },
    data: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      required: false,
      default: 'unread',
    },
  },

  { timestamps: true }
);

notificationSchema.pre('save', async function (next) {
  const isExistReceiver = await User.findOne({
    _id: this.receiverId,
  });
  if (!isExistReceiver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Receiver not found!');
  }
  next();
});

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);
