import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';

// Define interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'parent' | 'teacher' | 'director' | 'admin';
  profileImage?: string;
  theme?: 'light' | 'dark' | 'system';
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema
const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['parent', 'teacher', 'director', 'admin'],
      required: true,
    },
    profileImage: { type: String },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    lastActive: { type: Date },
  },
  { timestamps: true }
);

// Create or retrieve model
const User = mongoose.models.User || model<IUser>('User', UserSchema);

// Export model as default
export default User;