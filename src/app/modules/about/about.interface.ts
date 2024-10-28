import { Model } from 'mongoose';

export type IAbout = {
  title: string;
  description: string;
  image: string;
};

export type AboutModel = Model<IAbout>;
