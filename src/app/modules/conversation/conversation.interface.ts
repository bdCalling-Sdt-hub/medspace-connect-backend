import { Types } from 'mongoose';

export interface IConversation {
  spaceSeeker: Types.ObjectId;
  spaceProvider: Types.ObjectId;
  spaceId: Types.ObjectId;
  isActive: boolean;
}
