import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IRoadmapTemplate } from './RoadmapTemplate';

export interface IRoadmapStage extends Document {
  templateId: mongoose.Types.ObjectId | IRoadmapTemplate;
  title: string;
  description?: string;
  order: number;
  expectedDuration?: number; // in days
  skillCategory: 'cognitive' | 'physical' | 'social' | 'emotional' | 'language' | 'creativity';
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapStageSchema: Schema = new Schema(
  {
    templateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RoadmapTemplate',
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    expectedDuration: { type: Number }, // in days
    skillCategory: { 
      type: String, 
      enum: ['cognitive', 'physical', 'social', 'emotional', 'language', 'creativity'],
      required: true 
    },
  },
  { timestamps: true }
);

// Create index for efficient querying
RoadmapStageSchema.index({ templateId: 1, order: 1 }, { unique: true });

export default mongoose.models.RoadmapStage || model<IRoadmapStage>('RoadmapStage', RoadmapStageSchema);