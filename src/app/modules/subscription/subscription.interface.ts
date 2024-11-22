import { ObjectId } from 'mongoose';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

export interface ISubscription {
  _id: ObjectId;
  providerId: string;
  package: ObjectId;
  stripeSubscriptionId: string;
  amountPaid: number;
  trxId: string;
  status: TSubscriptionStatus;
  createdAt: Date;
}
