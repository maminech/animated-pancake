import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IUser } from './User';

export interface IRoadmapTemplate extends Document {
  name: string;
  description?: string;
  ageGroup: string;
  createdById: mongoose.Types.ObjectId | IUser;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    ageGroup: { type: String, required: true },
    createdById: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.RoadmapTemplate || model<IRoadmapTemplate>('RoadmapTemplate', RoadmapTemplateSchema);