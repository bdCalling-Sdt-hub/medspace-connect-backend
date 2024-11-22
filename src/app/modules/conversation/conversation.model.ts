import { model, Schema } from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new Schema<IConversation>(
  {
    spaceSeeker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    spaceProvider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isRead: { type: Boolean, default: false },
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>(
  'Conversation',
  conversationSchema
);
