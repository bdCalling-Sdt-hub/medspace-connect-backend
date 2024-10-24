import { Model, Types } from 'mongoose';

export type IMessage = {
  from: Types.ObjectId;
  to: Types.ObjectId;
  conversationID: Types.ObjectId;
  spaceID: Types.ObjectId;
  message: string;
  status?: 'unread' | 'read';
  data: object;
  date: string;
};

export type MessageModel = Model<IMessage>;
