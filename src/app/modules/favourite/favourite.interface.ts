import { Model } from 'mongoose';

import { Types } from 'mongoose';
export type IFavourite = {
  spaceId: Types.ObjectId;
  userId: Types.ObjectId;
};

export type FavouriteModel = Model<IFavourite>;
