import { Model, Types } from 'mongoose';

export type ISubscriber = {
  email: string;
  user?: Types.ObjectId;
};
export type SubscriberModel = Model<ISubscriber>;
