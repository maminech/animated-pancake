import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudent } from './Student';
import { IUser } from './User';

export interface IReport extends Document {
  studentId: mongoose.Types.ObjectId | IStudent;
  teacherId: mongoose.Types.ObjectId | IUser;
  date: string;
  mood: 'amazing' | 'happy' | 'okay' | 'sad' | 'upset';
  activities?: object;
  notes?: string;
  achievements?: object;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    date: { type: String, required: true },
    mood: { 
      type: String, 
      enum: ['amazing', 'happy', 'okay', 'sad', 'upset'],
      required: true 
    },
    activities: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    achievements: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Create index for faster querying by date
ReportSchema.index({ date: 1 });
// Create compound index for student and date
ReportSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.models.Report || model<IReport>('Report', ReportSchema);