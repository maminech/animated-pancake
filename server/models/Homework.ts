import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IClass } from './Class';
import { IUser } from './User';

export interface IHomework extends Document {
  title: string;
  description: string;
  classId: mongoose.Types.ObjectId | IClass;
  teacherId: mongoose.Types.ObjectId | IUser;
  dueDate: string;
  assignedDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  attachments?: any;
  maxPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    classId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class',
      required: true 
    },
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    dueDate: { type: String, required: true },
    assignedDate: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    subject: { type: String, required: true },
    attachments: { type: mongoose.Schema.Types.Mixed },
    maxPoints: { type: Number, default: 100 },
  },
  { timestamps: true }
);

// Index for efficient querying
HomeworkSchema.index({ classId: 1, dueDate: 1 });
HomeworkSchema.index({ assignedDate: 1 });

export default mongoose.models.Homework || model<IHomework>('Homework', HomeworkSchema);