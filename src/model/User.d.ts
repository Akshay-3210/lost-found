import type { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
  emailVerified?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

declare const User: Model<IUser>;

export default User;
