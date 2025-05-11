import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IConversation } from './Conversation';
import { IUser } from './User';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId | IConversation;
  senderId: mongoose.Types.ObjectId | IUser;
  content: string;
  sentAt: Date;
  attachments?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Conversation',
      required: true 
    },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    attachments: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create index for efficient querying
MessageSchema.index({ conversationId: 1, sentAt: 1 });

export default mongoose.models.Message || model<IMessage>('Message', MessageSchema);