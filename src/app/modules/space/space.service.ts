import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { ISpace } from './space.interface';
import { Space } from './space.model';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from '../user/user.interface';
import { USER_ROLES } from '../../../enums/user';
import { Package } from '../packages/package.model';
import { SPACE_STATUS } from '../../../enums/space';
import { Subscription } from '../subscription/subscription.model';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { Conversation } from '../conversation/conversation.model';
import mongoose from 'mongoose';
import { NotificationService } from '../notifications/notification.service';
import { Server } from 'socket.io';

const createSpaceToDB = async (
  payload: ISpace,
  id: string,
  io: Server
): Promise<ISpace> => {
  // Check if provider exists
  const isExistProvider: IUser | null = await User.findOne({
    _id: id,
    role: USER_ROLES.SPACEPROVIDER,
  });
  if (!isExistProvider) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not a space provider!'
    );
  }

  // Check subscription
  const isExistSubscription = await Subscription.findById(
    isExistProvider.subscription
  );
  if (!isExistSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have not bought any package yet!'
    );
  }

  // Check package
  const isExistPackage = await Package.findById(isExistSubscription.package);
  if (!isExistPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
  }

  // Calculate current period dates
  const subscriptionDate = new Date(isExistSubscription.createdAt);
  const startDate = new Date(subscriptionDate);
  const endDate = new Date(subscriptionDate);
  endDate.setDate(subscriptionDate.getDate() + 30); // Add exactly 30 days

  // For debugging
  console.log({
    subscriptionStart: subscriptionDate.toISOString(),
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  });

  // Find posts in current period
  const posts = await Space.find({
    providerId: id,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Check if post limit reached
  if (typeof (isExistPackage.allowedSpaces as number) === 'number') {
    if (posts.length >= (isExistPackage.allowedSpaces as number)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `You have reached your post limit (${
          isExistPackage.allowedSpaces
        }) for this 30-day period! Your next period starts ${endDate.toDateString()}`
      );
    }
  }

  // Create space
  const result = await Space.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create space!');
  }
  await NotificationService.sendNotificationToAllUserOfARole(
    {
      title: `New Space Created by ${isExistProvider.name}`,
      message: `${isExistProvider.name} has created a new space! with a name of ${result.title}`,
      data: {
        id: result._id,
        title: result.title,
        spaceId: result._id,
        spaceProvider: isExistProvider.name,
      },
    },
    USER_ROLES.ADMIN,
    io
  );
  return result;
};

const updateSpaceToDB = async (
  id: string,
  payload: any,
  userId: string
): Promise<ISpace> => {
  const isExist = await Space.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
  }
  let imageArray = isExist.spaceImages;
  if (payload.removeImages && payload.addImages) {
    imageArray = imageArray.filter(
      (image: string) => !payload.removeImages.includes(image)
    );
    imageArray = [...imageArray, ...payload.addImages];
    console.log(imageArray);
    if (imageArray.length < 4 || imageArray.length > 4) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only 4 images are required!'
      );
    }
    await unlinkFile(payload.removeImages);
  }
  if (isExist.providerId.toString() !== userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized!');
  }
  if (payload.status) {
    if (
      payload.status !== SPACE_STATUS.ACTIVE &&
      payload.status !== SPACE_STATUS.OCCUPIED
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status!');
    }
  }
  const result = await Space.findByIdAndUpdate(
    id,
    { ...payload, spaceImages: imageArray },
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update space!');
  }

  return result;
};

const updateSpaceImagesToDB = async (
  id: string,
  payload: string[],
  userId: string
): Promise<ISpace> => {
  const isExist = await Space.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
  }
  if (isExist.providerId.toString() !== userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized!');
  }
  isExist.spaceImages.map(async (image: string) => {
    await unlinkFile(image);
  });
  const result = await Space.findByIdAndUpdate(
    id,
    { spaceImages: [...payload] },
    { new: true }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update space images!'
    );
  }
  return result;
};
const addSpaceFacilitiesToDB = async (
  id: string,
  payload: string | [string]
): Promise<ISpace> => {
  let result: ISpace | null;
  if (typeof payload === 'string') {
    result = await Space.findByIdAndUpdate(
      id,
      { $push: { facilities: payload } },
      { new: true }
    );
  } else if (Array.isArray(payload)) {
    result = await Space.findByIdAndUpdate(
      id,
      { $push: { facilities: { $each: payload } } },
      { new: true }
    );
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'facilities must be an array of strings or just a string!'
    );
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update space facilities!'
    );
  }
  return result;
};
const removeSpaceFacilitiesToDB = async (
  id: string,
  payload: string | [string]
): Promise<ISpace> => {
  let result: ISpace | null;
  if (typeof payload === 'string') {
    result = await Space.findByIdAndUpdate(
      id,
      { $pull: { facilities: payload } },
      { new: true }
    );
  } else if (Array.isArray(payload)) {
    result = await Space.findByIdAndUpdate(
      id,
      { $pull: { facilities: { $in: payload } } },
      { new: true }
    );
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'facilities must be an array of strings or just a string!'
    );
  }
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to remove space facilities!'
    );
  }
  return result;
};
const getSpaceByIdFromDB = async (id: string): Promise<ISpace | null> => {
  const result = await Space.findById(id).populate('providerId');
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
  }

  return result;
};
const getAllSpacesFromDB = async (paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const result = await Space.find({ status: { $ne: SPACE_STATUS.OCCUPIED } })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate('providerId');

  const total = await Space.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const searchAndFilterSpaces = async (filterOptions: any) => {
  try {
    const { search, ...otherFilters } = filterOptions;
    let baseQuery: any = { status: SPACE_STATUS.ACTIVE };

    // Handle search term if provided
    if (search) {
      const searchWords = search.trim().toLowerCase().split(/\s+/);
      baseQuery.$or = searchWords.map((word: any) => ({
        $or: [
          { title: { $regex: word, $options: 'i' } },
          { description: { $regex: word, $options: 'i' } },
          { location: { $regex: word, $options: 'i' } },
          { facilities: { $regex: word, $options: 'i' } },
        ],
      }));
    }

    // Handle other filters
    const filterableFields = [
      'price',
      'priceType',
      'location',
      'openingDate',
      'practiceFor',
    ];

    Object.keys(otherFilters).forEach(key => {
      if (filterableFields.includes(key)) {
        if (key === 'location') {
          baseQuery[key] = { $regex: otherFilters[key], $options: 'i' };
        } else {
          baseQuery[key] = otherFilters[key];
        }
      }
    });

    // Handle facilities filter
    if (otherFilters.facilities) {
      baseQuery.facilities = {
        $in: otherFilters.facilities
          .split(',')
          .map((f: any) => new RegExp(f.trim(), 'i')),
      };
    }

    // Handle price range
    if (otherFilters.priceRange) {
      const [min, max] = otherFilters.priceRange.split('-');
      baseQuery.price = {
        $gte: parseFloat(min),
        $lte: parseFloat(max),
      };
    }

    // Fetch spaces with all filters applied
    const spaces = await Space.find(baseQuery).populate('providerId').lean();

    if (search) {
      // Calculate match scores only if there's a search term
      const searchWords = search.trim().toLowerCase().split(/\s+/);
      const rankedSpaces = spaces.map(space => {
        let matchScore = 0;
        const spaceText = `${space.title} ${
          space.description
        } ${space.facilities.join(' ')}`.toLowerCase();

        searchWords.forEach((word: any) => {
          if (spaceText.includes(word.toLowerCase())) {
            matchScore++;
          }
        });

        return {
          ...space,
          matchScore,
        };
      });

      // Sort by match score first, then by date
      const sortedSpaces = rankedSpaces.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return (
          //@ts-ignore
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      return sortedSpaces.map(({ matchScore, ...space }) => space);
    }

    // If no search term, just return filtered spaces sorted by date
    return spaces.sort(
      (a, b) =>
        //@ts-ignore
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error searching and filtering spaces'
    );
  }
};
const getProvidersFromDB = async (
  page: number,
  limit: number
): Promise<IUser[]> => {
  const result = await User.find({ role: USER_ROLES.SPACEPROVIDER })
    .select(
      '-password -refreshToken -createdAt -updatedAt -role -authorization -verified'
    )
    .skip((page - 1) * limit)
    .limit(limit);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Providers not found!');
  }
  return result;
};
const getSpaceStatusFromDB = async (): Promise<any[]> => {
  const totalProvider = await User.find({
    role: USER_ROLES.SPACEPROVIDER,
  }).countDocuments();
  const totalSeeker = await User.find({
    role: USER_ROLES.SPACESEEKER,
  }).countDocuments();
  const totalConversation = await Conversation.find({}).countDocuments();
  const finalResult: any = {
    totalProvider,
    totalSeeker,
    totalDeals: totalConversation,
  };
  return finalResult;
};
const getMySpacesFromDB = async (userId: string): Promise<ISpace[]> => {
  const isExistProvider = await User.findById(userId);
  if (!isExistProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
  }
  const result = await Space.find({ providerId: isExistProvider._id }).populate(
    'providerId'
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Spaces not found!');
  }
  return result;
};
const getRecentSpacesFromDB = async (): Promise<ISpace[]> => {
  const result = await Space.find({ status: { $ne: SPACE_STATUS.OCCUPIED } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('providerId');

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Spaces not found!');
  }
  return result;
};
const getInterestedSpacesFromDB = async (userId: string): Promise<ISpace[]> => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
  }

  const interestedSpaces = await Conversation.find({
    spaceSeeker: isExistUser._id,
  }).populate({
    path: 'spaceId',
    populate: { path: 'providerId' },
  });

  if (!interestedSpaces) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Spaces not found!');
  }

  const finalResult = interestedSpaces.map((item: any) => {
    const conversationStarted = new Date(item.createdAt);
    const todaysDate = new Date();

    const totalDays = Math.floor(
      (todaysDate.getTime() - conversationStarted.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Calculate months and remaining days
    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;

    // Create appropriate string based on months and days
    let activeSince = '';
    if (months > 0 && remainingDays > 0) {
      activeSince = `${months} month${
        months > 1 ? 's' : ''
      } and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    } else if (months > 0) {
      activeSince = `${months} month${months > 1 ? 's' : ''}`;
    } else {
      activeSince = `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }

    const finalData = {
      ...item.spaceId._doc,
      activeSince,
      interestedSince: conversationStarted.toDateString(),
    };
    return finalData;
  });

  return finalResult;
};

export const SpaceService = {
  createSpaceToDB,
  getSpaceStatusFromDB,
  updateSpaceToDB,
  updateSpaceImagesToDB,
  addSpaceFacilitiesToDB,
  searchAndFilterSpaces,
  removeSpaceFacilitiesToDB,
  getMySpacesFromDB,
  getSpaceByIdFromDB,
  getAllSpacesFromDB,
  getProvidersFromDB,
  getRecentSpacesFromDB,
  getInterestedSpacesFromDB,
};
