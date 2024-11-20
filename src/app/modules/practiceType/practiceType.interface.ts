import { Model, Types } from 'mongoose';

export type IPracticeType = {
  type: string
};

export type PracticeTypeModel = Model<IPracticeType>;
