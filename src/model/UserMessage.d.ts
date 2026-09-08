import type mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IUserMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  senderName?: string;
  senderEmail: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

declare const UserMessage: Model<IUserMessage>;

export default UserMessage;
