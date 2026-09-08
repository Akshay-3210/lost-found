import mongoose, { Schema } from 'mongoose';

const userMessageSchema = new Schema(
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

const UserMessage =
  mongoose.models.UserMessage ||
  mongoose.model('UserMessage', userMessageSchema);

export default UserMessage;
