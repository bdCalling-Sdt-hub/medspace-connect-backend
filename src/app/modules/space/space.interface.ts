import { Model, Types } from 'mongoose';
import { SPACE_STATUS } from '../../../enums/space';

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
  priceType: 'Yearly' | 'Monthly';
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
