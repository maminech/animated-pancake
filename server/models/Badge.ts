import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'behavioral' | 'attendance' | 'special';
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['academic', 'behavioral', 'attendance', 'special'],
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Badge || model<IBadge>('Badge', BadgeSchema);