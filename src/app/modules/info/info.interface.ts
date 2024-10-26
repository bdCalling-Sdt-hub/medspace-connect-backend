import { Model } from 'mongoose';

export type IInfo = {
  termsAndConditions: string;
  privacyPolicy: string;
  aboutUs: string;
};

export type IInfoModel = Model<IInfo>;
