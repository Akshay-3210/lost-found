import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
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
    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const existingUserModel = mongoose.models.User;
const hasCurrentProfileFields =
  existingUserModel?.schema.path('phone') &&
  existingUserModel?.schema.path('location') &&
  existingUserModel?.schema.path('bio') &&
  existingUserModel?.schema.path('image') &&
  existingUserModel?.schema.path('emailVerificationToken') &&
  existingUserModel?.schema.path('emailVerificationExpires');

// In local dev, Next.js hot reload can keep an older compiled model around.
// Rebuild it when the cached schema is missing newer profile fields.
if (existingUserModel && !hasCurrentProfileFields) {
  delete mongoose.models.User;
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
