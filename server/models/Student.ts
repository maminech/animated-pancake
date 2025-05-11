import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IUser } from './User';
import { IClass } from './Class';

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profileImage?: string;
  parentId: mongoose.Types.ObjectId | IUser;
  classId: mongoose.Types.ObjectId | IClass;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    profileImage: { type: String },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  },
  { timestamps: true }
);

export default mongoose.models.Student || model<IStudent>('Student', StudentSchema);