import { Schema, model } from 'mongoose';
import { ISupportItem, SupportItemModel } from './supportItem.interface';

const supportItemSchema = new Schema<ISupportItem, SupportItemModel>({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export const SupportItem = model<ISupportItem, SupportItemModel>(
  'supportItem',
  supportItemSchema
);
