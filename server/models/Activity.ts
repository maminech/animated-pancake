import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IClass } from './Class';

// Define interface
export interface IActivity extends Document {
  name: string;
  classId: mongoose.Types.ObjectId | IClass;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema
const ActivitySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    classId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class' 
    },
  },
  { timestamps: true }
);

// Create or retrieve model
const Activity = mongoose.models.Activity || model<IActivity>('Activity', ActivitySchema);

// Export model as default
export default Activity;