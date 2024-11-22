import { Model } from 'mongoose';
import { INFO_NAME } from '../../../enums/info';

export type IInfo = {
  name: INFO_NAME.USERAGRREEMENT | INFO_NAME.TERMSANDCONDITIONS;
  content: string;
};

export type IInfoModel = Model<IInfo>;
