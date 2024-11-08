import { Types } from 'mongoose';

export interface IConversation {
  spaceSeeker: Types.ObjectId;
  spaceProvider: Types.ObjectId;
  isRead?: boolean;
  spaceId: Types.ObjectId;
}
