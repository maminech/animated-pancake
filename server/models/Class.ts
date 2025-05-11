import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IUser } from './User';

export interface IClass extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Class || model<IClass>('Class', ClassSchema);