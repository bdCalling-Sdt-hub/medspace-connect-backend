import { Schema, model } from 'mongoose';
import { ISubscription } from './subscription.interface';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

const subscriptionSchema = new Schema<ISubscription>(
  {
    package: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    trxId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
    },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
