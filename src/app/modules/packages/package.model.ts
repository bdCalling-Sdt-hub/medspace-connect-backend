import { model, Schema } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';

const packageSchema = new Schema<IPackage, PackageModel>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceId: {
      type: String,
      required: false,
    },
    features: {
      type: [String],
      required: true,
    },
    allowedSpaces: {
      type: Number,
      required: true,
    },
    stripeProductId: {
      type: String,
    },
    paymentLink: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

packageSchema.pre('save', async function (next) {
  next();
});

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
