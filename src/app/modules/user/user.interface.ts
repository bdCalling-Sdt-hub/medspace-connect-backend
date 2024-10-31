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
  isSubscribed: boolean;
  email: string;
  password: string;
  location?: string;
  profile?: string;
  NIDOrPassportNo?: string;
  education?: Education[];
  occupation?: string;
  status: 'active' | 'delete';
  deviceTokens?: string[];
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid';
  subscription?: Types.ObjectId;

  trxId?: string;
  verified: boolean;
  stripeAccountInfo?: {
    stripeCustomerId?: string;
    loginUrl?: string;
  } | null;
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
