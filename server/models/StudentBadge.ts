import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudent } from './Student';
import { IBadge } from './Badge';
import { IUser } from './User';

export interface IStudentBadge extends Document {
  studentId: mongoose.Types.ObjectId | IStudent;
  badgeId: mongoose.Types.ObjectId | IBadge;
  dateAwarded: string;
  awardedBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const StudentBadgeSchema: Schema = new Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    badgeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Badge',
      required: true 
    },
    dateAwarded: { type: String, required: true },
    awardedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
  },
  { timestamps: true }
);

// Create compound index to prevent duplicate badge awards
StudentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true });

export default mongoose.models.StudentBadge || model<IStudentBadge>('StudentBadge', StudentBadgeSchema);