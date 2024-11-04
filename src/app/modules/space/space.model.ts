import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IsPathDefaultUndefined } from 'mongoose/types/inferschematype';
import { ISpace, SpaceModel } from './space.interface';
import { User } from '../user/user.model';
import { SPACE_STATUS } from '../../../enums/space';
const spaceSchema = new Schema<ISpace, SpaceModel>(
  {
    spaceImages: {
      type: [String],
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: SPACE_STATUS,
      default: SPACE_STATUS.ACTIVE,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    openingDate: {
      type: String,
      required: true,
    },
    practiceFor: {
      type: String,
      required: true,
    },
    facilities: {
      type: [String],
      required: true,
    },
    speciality: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

spaceSchema.pre('save', async function (next) {
  const isExistProvider = await User.findOne({
    _id: this.providerId,
    role: USER_ROLES.SPACEPROVIDER,
  });
  if (!isExistProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Provider not found!');
  }
  next();
});

export const Space = model<ISpace, SpaceModel>('Space', spaceSchema);
