import { Model } from 'mongoose';

export type IInfo = {
  name: string;
  content: string;
};

export type IInfoModel = Model<IInfo>;
