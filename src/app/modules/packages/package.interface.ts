import { Model, Types } from 'mongoose';

export type IPackage = {
  name: string;
  price: number;
  duration: number;
  features: string[];
  allowedSpaces: number;
  stripeProductId?: string;
  stripePriceId?: string;
};

export type PackageModel = Model<IPackage>;
