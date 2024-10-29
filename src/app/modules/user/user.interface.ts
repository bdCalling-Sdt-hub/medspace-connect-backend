import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
interface Education {
  degree: string;
  institutionName: string;
  institutionLocation: string;
  startYear: string;
  endYear: string;
}
export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  location?: string;
  planPurchasedAt?: Date;
  plan?: Types.ObjectId;
  postLimit?: number | 'UNLIMITED';
  profile?: string;
  NIDOrPassportNo?: string;
  education?: Education[];
  occupation?: string;
  status: 'active' | 'delete';
  deviceTokens?: string[];
  stripeCustomerId?: string;
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
