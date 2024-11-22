import { Model, Types } from 'mongoose';

export type INotification = {
  title: string;
  message: string;
  receiverId?: Types.ObjectId;
  data?: object;
  type?: 'new_message' | 'normal';
  status?: 'read' | 'unread';
};

export type NotificationModel = Model<INotification>;
