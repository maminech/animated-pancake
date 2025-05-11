import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IStudentRoadmap } from './StudentRoadmap';
import { IRoadmapStage } from './RoadmapStage';

export interface IStageProgress extends Document {
  studentRoadmapId: mongoose.Types.ObjectId | IStudentRoadmap;
  stageId: mongoose.Types.ObjectId | IRoadmapStage;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  startedAt?: Date;
  completedAt?: Date;
  teacherFeedback?: string;
  evidence?: any; // links to photos, videos, notes
  createdAt: Date;
  updatedAt: Date;
}

const StageProgressSchema: Schema = new Schema(
  {
    studentRoadmapId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'StudentRoadmap',
      required: true 
    },
    stageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RoadmapStage',
      required: true 
    },
    status: { 
      type: String, 
      enum: ['not_started', 'in_progress', 'completed', 'needs_review'],
      default: 'not_started'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    teacherFeedback: { type: String },
    evidence: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Create compound index for student roadmap and stage to ensure uniqueness
StageProgressSchema.index({ studentRoadmapId: 1, stageId: 1 }, { unique: true });

export default mongoose.models.StageProgress || model<IStageProgress>('StageProgress', StageProgressSchema);