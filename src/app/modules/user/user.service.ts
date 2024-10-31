import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { subscribeToTopic } from '../../../helpers/firebaseNotificationHelper';
import { errorLogger } from '../../../shared/logger';

const createUserToDB = async (payload: Partial<any>): Promise<IUser> => {
  //set role
  if (!payload.role) {
    payload.role = USER_ROLES.SPACESEEKER;
  }
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 60 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const manageDeviceToken = async (
  userId: string,
  token: string,
  action: 'add' | 'remove'
) => {
  try {
    const update =
      action === 'add'
        ? { $addToSet: { deviceTokens: token } }
        : { $pull: { deviceTokens: token } };

    await User.findByIdAndUpdate(userId, update);

    if (action === 'add') {
      // Subscribe to role-based topic
      const user = await User.findById(userId);
      if (user?.role) {
        await subscribeToTopic(token, `role_${user.role.toLowerCase()}`);
      }
    }
  } catch (error) {
    errorLogger.error(`Error ${action}ing device token:`, error);
    throw error;
  }
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  manageDeviceToken,
};
