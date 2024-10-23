import { Model, Types } from 'mongoose';
import { SPACE_STATUS } from '../../../enums/space';

export type IPackage = {
  name: string;
  price: number;
  duration: number;
  features: string[];
  allowedSpaces: number;
};

export type PackageModel = Model<IPackage>;
