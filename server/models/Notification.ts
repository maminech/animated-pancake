import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IUser } from './User';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  title: string;
  content: string;
  type: 'message' | 'homework' | 'attendance' | 'milestone' | 'badge' | 'system' | 'report';
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['message', 'homework', 'attendance', 'milestone', 'badge', 'system', 'report'],
      required: true 
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceType: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create index for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.models.Notification || model<INotification>('Notification', NotificationSchema);