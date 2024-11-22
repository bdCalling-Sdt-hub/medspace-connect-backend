import { Schema, model } from 'mongoose';
import { IAbout, AboutModel } from './about.interface';

const aboutSchema = new Schema<IAbout, AboutModel>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
});

export const About = model<IAbout, AboutModel>('about', aboutSchema);
