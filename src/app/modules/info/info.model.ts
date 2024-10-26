import { model, Schema } from 'mongoose';
import { IInfo, IInfoModel } from './info.interface';

const infoSchema = new Schema<IInfo, IInfoModel>(
  {
    termsAndConditions: {
      type: String,
      required: true,
    },
    privacyPolicy: {
      type: String,
      required: true,
    },
    aboutUs: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Info = model<IInfo, IInfoModel>('Info', infoSchema);
