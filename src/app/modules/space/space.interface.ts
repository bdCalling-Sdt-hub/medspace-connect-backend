import { Model, Types } from 'mongoose';
import { SPACE_STATUS } from '../../../enums/space';
import { PRICETYPE } from '../../../enums/priceType';

export type ISpaceProvider = {
  name: string;
  email: string;
  password: string;
};

export type ISpace = {
  spaceImages: string[];
  providerId: Types.ObjectId;
  title: string;
  price: number;
  priceType:
    | PRICETYPE.HOURLY
    | PRICETYPE.DAILY
    | PRICETYPE.WEEKLY
    | PRICETYPE.MONTHLY
    | PRICETYPE.YEARLY;
  status?: SPACE_STATUS;
  location: string;
  openingDate: string;
  speciality?: string;
  practiceType?: string;
  practiceFor: string;
  facilities: string[];
  description: string;
};

export type SpaceModel = Model<ISpace>;
