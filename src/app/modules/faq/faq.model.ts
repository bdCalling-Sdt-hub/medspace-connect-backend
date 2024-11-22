import { model, Schema } from 'mongoose';
import { IFaq, FaqModel } from './faq.interface';

const faqSchema = new Schema<IFaq, FaqModel>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Faq = model<IFaq, FaqModel>('Faq', faqSchema);
