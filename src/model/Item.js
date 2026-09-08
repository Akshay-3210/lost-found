import mongoose, { Schema } from 'mongoose';

const itemSchema = new Schema(
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

const existingItemModel = mongoose.models.Item;
const hasCurrentClaimedByNameField = existingItemModel?.schema.path('claimedByName');

// In local dev, hot reload can keep an older compiled Item model around.
// Rebuild it when the cached schema is missing claimedByName.
if (existingItemModel && !hasCurrentClaimedByNameField) {
  delete mongoose.models.Item;
}

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;
