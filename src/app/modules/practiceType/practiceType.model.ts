import { Schema, model } from 'mongoose';
import { IPracticeType, PracticeTypeModel } from './practiceType.interface';

const practiceTypeSchema = new Schema<IPracticeType, PracticeTypeModel>(
  {
    type: { type: String, required: true },
  },
  { timestamps: true }
);

export const PracticeType = model<IPracticeType, PracticeTypeModel>(
  'PracticeType',
  practiceTypeSchema
);
