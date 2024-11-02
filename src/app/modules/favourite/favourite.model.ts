import { Schema, model } from 'mongoose';
import { IFavourite, FavouriteModel } from './favourite.interface';

const favouriteSchema = new Schema<IFavourite, FavouriteModel>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'space', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { timestamps: true }
);

export const Favourite = model<IFavourite, FavouriteModel>(
  'favourite',
  favouriteSchema
);
