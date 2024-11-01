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

const userStatisticFromDB = async (year: number): Promise<IUser[]> => {
  const months: any = [
    { name: 'Jan', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Feb', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Mar', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Apr', spaceprovider: 0, spaceseeker: 0 },
    { name: 'May', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Jun', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Jul', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Aug', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Sep', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Oct', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Nov', spaceprovider: 0, spaceseeker: 0 },
    { name: 'Dec', spaceprovider: 0, spaceseeker: 0 },
  ];

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  // Aggregate users by month
  const monthlyEmployer = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.SPACESEEKER,
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } },
    },
  ]);

  // Aggregate artists by month
  const monthlyProvider = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.SPACEPROVIDER,
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } },
    },
  ]);

  // Merge user data into the months array
  monthlyEmployer.forEach((employer: any) => {
    const monthIndex = employer._id.month - 1;
    months[monthIndex].employer = employer.count;
  });

  // Merge provider data into the months array
  monthlyProvider.forEach((provider: any) => {
    const monthIndex = provider._id.month - 1;
    months[monthIndex].provider = provider.count;
  });

  return months;
};
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  userStatisticFromDB,
};
