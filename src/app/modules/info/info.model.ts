import { model, Schema } from 'mongoose';
import { IInfo, IInfoModel } from './info.interface';
import { INFO_NAME } from '../../../enums/info';

const infoSchema = new Schema<IInfo, IInfoModel>(
  {
    name: {
      type: String,
      enum: INFO_NAME,
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
