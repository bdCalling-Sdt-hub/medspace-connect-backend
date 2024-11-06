import { Schema, model } from 'mongoose';
import { ILinks, LinksModel } from './links.interface';

const linksSchema = new Schema<ILinks, LinksModel>(
  {
    icon: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Links = model<ILinks, LinksModel>('Links', linksSchema);
