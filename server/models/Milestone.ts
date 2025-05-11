import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudent } from './Student';
import { IUser } from './User';

export interface IMilestone extends Document {
  studentId: mongoose.Types.ObjectId | IStudent;
  title: string;
  description?: string;
  date: string;
  category: 'academic' | 'behavioral' | 'physical' | 'social' | 'creative';
  completed: boolean;
  teacherId: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema: Schema = new Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['academic', 'behavioral', 'physical', 'social', 'creative'],
      required: true 
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Milestone || model<IMilestone>('Milestone', MilestoneSchema);