import mongoose, { Schema, Document, Model } from 'mongoose';

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

const itemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Type is required'],
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'claimed'],
      default: 'active',
    },
    location: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    images: {
      type: [String],
      default: [],
    },
    contactInfo: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    claimedByName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ userId: 1 });

const existingItemModel = mongoose.models.Item as Model<IItem> | undefined;
const hasCurrentClaimedByNameField = existingItemModel?.schema.path('claimedByName');

// In local dev, hot reload can keep an older compiled Item model around.
// Rebuild it when the cached schema is missing claimedByName.
if (existingItemModel && !hasCurrentClaimedByNameField) {
  delete mongoose.models.Item;
}

const Item: Model<IItem> = (mongoose.models.Item as Model<IItem>) || mongoose.model<IItem>('Item', itemSchema);

export default Item;
