import type mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  type: 'lost' | 'found';
  status: 'active' | 'resolved' | 'claimed';
  location?: string;
  date?: Date;
  images?: string[];
  contactInfo?: string;
  userId: mongoose.Types.ObjectId;
  claimedBy?: mongoose.Types.ObjectId;
  claimedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare const Item: Model<IItem>;

export default Item;
