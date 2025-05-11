import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudent } from './Student';
import { IRoadmapTemplate } from './RoadmapTemplate';
import { IRoadmapStage } from './RoadmapStage';

export interface IStudentRoadmap extends Document {
  studentId: mongoose.Types.ObjectId | IStudent;
  templateId: mongoose.Types.ObjectId | IRoadmapTemplate;
  startDate: Date;
  currentStageId?: mongoose.Types.ObjectId | IRoadmapStage;
  teacherNotes?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentRoadmapSchema: Schema = new Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true 
    },
    templateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RoadmapTemplate',
      required: true 
    },
    startDate: { type: Date, default: Date.now },
    currentStageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RoadmapStage'
    },
    teacherNotes: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create compound index for student and template to ensure uniqueness
StudentRoadmapSchema.index({ studentId: 1, templateId: 1 }, { unique: true });

export default mongoose.models.StudentRoadmap || model<IStudentRoadmap>('StudentRoadmap', StudentRoadmapSchema);