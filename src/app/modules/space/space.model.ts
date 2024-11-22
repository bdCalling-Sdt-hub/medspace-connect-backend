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
import { PRICETYPE } from '../../../enums/priceType';
const spaceSchema = new Schema<ISpace, SpaceModel>(
  {
    spaceImages: {
      type: [String],
      required: [true, 'Space images are required'],
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    priceType: {
      type: String,
      enum: Object.values(PRICETYPE),
      required: [true, 'Price type is required'],
    },
    status: {
      type: String,
      enum: SPACE_STATUS,
      default: SPACE_STATUS.ACTIVE,
      required: false,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    openingDate: {
      type: String,
      required: [true, 'Opening date is required'],
    },
    practiceFor: {
      type: String,
      required: [true, 'Practice for is required'],
    },
    facilities: {
      type: [String],
      required: [true, 'Facilities are required'],
    },
    speciality: {
      type: String,
      required: false,
    },
    practiceType: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
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
