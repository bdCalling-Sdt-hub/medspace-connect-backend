import { Schema, model } from 'mongoose';
import { IPracticeNeed, PracticeNeedModel } from './practiceNeed.interface';

const practiceNeedSchema = new Schema<IPracticeNeed, PracticeNeedModel>({
  need: { type: String, required: true }
}, { timestamps: true });

export const PracticeNeed = model<IPracticeNeed, PracticeNeedModel>('PracticeNeed', practiceNeedSchema);
