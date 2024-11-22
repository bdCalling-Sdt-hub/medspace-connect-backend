import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import config from '../../../config';
import { ADMIN_TYPES, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { Subscriber } from '../subscribers/subscriber.model';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    adminType: {
      type: String,
      enum: ADMIN_TYPES,
      required: false,
    },
    banner: {
      type: String,
      required: false,
      default: '/banners/default.png',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    contact: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    subscription: {
      type: Types.ObjectId,
      ref: 'Subscription',
      required: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    trxId: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    occupation: {
      type: String,
      required: false,
      default: '',
    },
    education: {
      degree: {
        type: String,
        required: false,
        default: '',
      },
      institutionName: {
        type: String,
        required: false,
        default: '',
      },
      institutionLocation: {
        type: String,
        required: false,
        default: '',
      },
      startYear: {
        type: String,
        required: false,
        default: '',
      },
      endYear: {
        type: String,
        required: false,
        default: '',
      },
    },
    profile: {
      type: String,
      default: '/profiles/default.png',
    },

    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    NIDOrPassportNo: {
      type: String,
      required: false,
    },
    stripeAccountInfo: {
      stripeCustomerId: {
        type: String,
        required: false,
      },
      loginUrl: {
        type: String,
        required: false,
      },
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  const createSubscriber = await Subscriber.create({
    email: this.email,
  });
  if (!createSubscriber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscriber not created!');
  }
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
