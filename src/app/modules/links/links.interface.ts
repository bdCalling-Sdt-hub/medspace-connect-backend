import { Model, Types } from 'mongoose';

export type ILinks = {
  icon: string;
  url: string;
};

export type LinksModel = Model<ILinks>;
