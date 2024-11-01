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

const createSpaceToDB = async (
  payload: ISpace,
  id: string
): Promise<ISpace> => {
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
  const isExistSubscription = await Subscription.findById(
    isExistProvider.subscription
  );

  if (!isExistSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have not bought any package yet!'
    );
  }
  const isExistPackage = await Package.findById(isExistSubscription.package);
  if (!isExistPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
  }
  const currentDate = new Date();
  const planPurchaseDate = new Date(isExistSubscription.createdAt);
  const daysSincePurchase = Math.floor(
    (currentDate.getTime() - planPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const thirtyDayPeriods = Math.floor(daysSincePurchase / 30);

  const startDate = new Date(
    planPurchaseDate.getTime() + thirtyDayPeriods * 30 * 24 * 60 * 60 * 1000
  );

  const posts = await Space.find({
    providerId: id,
    createdAt: { $gte: startDate, $lte: currentDate },
  });

  if (typeof (isExistPackage.allowedSpaces as number) === 'number') {
    if (posts.length >= (isExistPackage.allowedSpaces as number)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You have reached your post limit for this 30-day period!'
      );
    }
  }
  const result = await Space.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create space!');
  }
  return result;
};

const updateSpaceToDB = async (
  id: string,
  payload: ISpace,
  userId: string
): Promise<ISpace> => {
  const isExist = await Space.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
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
  const result = await Space.findByIdAndUpdate(id, payload, { new: true });
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
  const result = await Space.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Space not found!');
  }
  return result;
};
const getAllSpacesFromDB = async (paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const result = await Space.find()
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

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

const filterSpacesFromDB = async (query: any): Promise<ISpace[]> => {
  const filterableFields = [
    'title',
    'price',
    'status',
    'priceType',
    'location',
    'openingDate',
    'practiceFor',
    'facilities',
    'description',
  ];

  const filter: any = {};

  Object.keys(query).forEach(key => {
    if (filterableFields.includes(key)) {
      if (key === 'facilities') {
        filter[key] = { $in: query[key].split(',') };
      } else if (
        key === 'title' ||
        key === 'description' ||
        key === 'location'
      ) {
        filter[key] = { $regex: query[key], $options: 'i' };
      } else {
        filter[key] = query[key];
      }
    }
  });

  if (query.priceRange) {
    const [min, max] = query.priceRange.split('-');
    filter.price = { $gte: parseFloat(min), $lte: parseFloat(max) };
  }

  const result = await Space.find(filter, { status: SPACE_STATUS.ACTIVE });

  if (!result.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No spaces found matching the criteria'
    );
  }

  return result;
};
const getProvidersFromDB = async (): Promise<IUser[]> => {
  const result = await User.find({ role: USER_ROLES.SPACEPROVIDER }).select(
    '-password -refreshToken -createdAt -updatedAt -role -authorization -verified'
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Providers not found!');
  }
  return result;
};
export const SpaceService = {
  createSpaceToDB,
  updateSpaceToDB,
  updateSpaceImagesToDB,
  addSpaceFacilitiesToDB,
  filterSpacesFromDB,
  removeSpaceFacilitiesToDB,
  getSpaceByIdFromDB,
  getAllSpacesFromDB,
  getProvidersFromDB,
};
