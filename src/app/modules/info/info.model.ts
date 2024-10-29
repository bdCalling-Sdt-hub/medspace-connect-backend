import { model, Schema } from 'mongoose';
import { IInfo, IInfoModel } from './info.interface';

const infoSchema = new Schema<IInfo, IInfoModel>(
  {
    name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Info = model<IInfo, IInfoModel>('Info', infoSchema);
