import { Model, Types } from 'mongoose';

export type IPackage = {
  name: string;
  price: number;
  features: string[];
  allowedSpaces: number;
  stripeProductId?: string;
  paymentLink?: string;
};

export type PackageModel = Model<IPackage>;
