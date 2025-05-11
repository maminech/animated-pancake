import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudent } from './Student';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId | IStudent;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    date: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'late'],
      required: true 
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Create index for faster querying by date
AttendanceSchema.index({ date: 1 });
// Create compound index for student and date
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);