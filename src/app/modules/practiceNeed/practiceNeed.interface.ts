import { Model, Types } from 'mongoose';

export type IPracticeNeed = {
  need: string
};

export type PracticeNeedModel = Model<IPracticeNeed>;
