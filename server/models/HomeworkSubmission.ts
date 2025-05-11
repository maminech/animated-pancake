import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IHomework } from './Homework';
import { IStudent } from './Student';

export interface IHomeworkSubmission extends Document {
  homeworkId: mongoose.Types.ObjectId | IHomework;
  studentId: mongoose.Types.ObjectId | IStudent;
  submissionDate: Date;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  attachments?: any;
  feedback?: string;
  score?: number;
  isLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSubmissionSchema: Schema = new Schema(
  {
    homeworkId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Homework',
      required: true 
    },
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    submissionDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['not_started', 'in_progress', 'submitted', 'graded'],
      default: 'not_started'
    },
    attachments: { type: mongoose.Schema.Types.Mixed },
    feedback: { type: String },
    score: { type: Number },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create compound index for homework and student to ensure uniqueness
HomeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.HomeworkSubmission || model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);