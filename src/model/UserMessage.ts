import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  senderName?: string;
  senderEmail: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const userMessageSchema = new Schema<IUserMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      trim: true,
      default: '',
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

userMessageSchema.index({ recipientId: 1, createdAt: -1 });

const UserMessage: Model<IUserMessage> =
  (mongoose.models.UserMessage as Model<IUserMessage>) ||
  mongoose.model<IUserMessage>('UserMessage', userMessageSchema);

export default UserMessage;
