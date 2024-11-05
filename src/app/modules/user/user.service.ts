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
import { Subscription } from '../subscription/subscription.model';
import { Space } from '../space/space.model';

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
  const values: any = {
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
): Promise<Partial<any>> => {
  const { id } = user;
  const isExistUser = await User.findById(id).select('-password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.role !== USER_ROLES.SPACEPROVIDER) {
    return { user: isExistUser };
  }

  const userSubscription = await Subscription.findOne({
    providerId: id,
  }).populate('package');

  if (!userSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have not bought any package yet!'
    );
  }

  // Create dates in UTC to match the stored format
  const subscriptionDate = new Date(userSubscription?.createdAt);
  const currentDate = new Date();

  // Calculate days since subscription
  const daysSinceSubscription = Math.floor(
    (currentDate.getTime() - subscriptionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const thirtyDayPeriods = Math.floor(daysSinceSubscription / 30);

  // Calculate period start and end dates
  const startDate = new Date(subscriptionDate);
  const endDate = new Date(subscriptionDate);
  endDate.setDate(subscriptionDate.getDate() + 30); // Add exactly 30 days

  // Query spaces posted in this period
  const spacesPosted = await Space.find({
    providerId: id,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // For debugging
  console.log({
    subscriptionCreated: subscriptionDate.toISOString(),
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  });

  const finalResult = {
    user: isExistUser,
    posts: spacesPosted,
    //@ts-ignore
    allowedSpaces: userSubscription?.package.allowedSpaces!,
    spacesPosted: spacesPosted.length,
    deadLine: endDate.toDateString(),
  };

  return finalResult;
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
  if (payload.profile && isExistUser.profile !== '/profiles/default.png') {
    unlinkFile(isExistUser.profile);
  }
  if (payload.banner && isExistUser.banner !== '/banners/default.png') {
    unlinkFile(isExistUser.banner);
  }
  if (payload.profile === null) {
    payload.profile = isExistUser.profile;
  }
  if (payload.banner === null) {
    payload.banner = isExistUser.banner;
  }

  const updateDoc: any = await User.findOneAndUpdate({ _id: id }, payload, {
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
    months[monthIndex].spaceseeker = employer.count;
  });

  // Merge provider data into the months array
  monthlyProvider.forEach((provider: any) => {
    const monthIndex = provider._id.month - 1;
    months[monthIndex].spaceprovider = provider.count;
  });

  return months;
};
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  userStatisticFromDB,
};
