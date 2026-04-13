import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const existingUserModel = mongoose.models.User as Model<IUser> | undefined;
const hasCurrentProfileFields =
  existingUserModel?.schema.path('phone') &&
  existingUserModel?.schema.path('location') &&
  existingUserModel?.schema.path('bio') &&
  existingUserModel?.schema.path('image');

// In local dev, Next.js hot reload can keep an older compiled model around.
// Rebuild it when the cached schema is missing newer profile fields.
if (existingUserModel && !hasCurrentProfileFields) {
  delete mongoose.models.User;
}

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
