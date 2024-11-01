import { Model } from 'mongoose';

export type ISupportItem = {
  title: string;
  type: string;
  description: string;
};

export type SupportItemModel = Model<ISupportItem>;
