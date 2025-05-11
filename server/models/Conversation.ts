import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';

export interface IConversation extends Document {
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    title: { type: String },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Conversation || model<IConversation>('Conversation', ConversationSchema);