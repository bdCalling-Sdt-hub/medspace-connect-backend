import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { User } from '../../user/user.model';
import { USER_ROLES } from '../../../../enums/user';
import ApiError from '../../../../errors/ApiError';
import { Space } from '../../space/space.model';
import { Conversation } from '../conversation.model';
const messageSchema = new Schema<IMessage, MessageModel>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    spaceID: {
      type: Schema.Types.ObjectId,
      ref: 'Space',
    },
    conversationID: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.pre('save', async function (next) {
  const isExistFrom = await User.findById(this.from);
  if (!isExistFrom) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'From user not found!');
  }
  const isExistTo = await User.findById(this.to);
  if (!isExistTo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'To user not found!');
  }
  const isExistSpace = await Space.findOne({
    _id: this.spaceID,
  });
  if (!isExistSpace) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
  }
  const isExistConversation = await Conversation.findOne({
    _id: this.conversationID,
  });
  if (!isExistConversation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation not found!');
  }
  next();
});

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
