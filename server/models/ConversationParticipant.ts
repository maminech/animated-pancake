import mongoose from 'mongoose';
import { Schema, Document, model } from 'mongoose';
import { IConversation } from './Conversation';
import { IUser } from './User';

export interface IConversationParticipant extends Document {
  conversationId: mongoose.Types.ObjectId | IConversation;
  userId: mongoose.Types.ObjectId | IUser;
  joinedAt: Date;
  lastReadMessageId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationParticipantSchema: Schema = new Schema(
  {
    conversationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Conversation',
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    joinedAt: { type: Date, default: Date.now },
    lastReadMessageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message'
    },
  },
  { timestamps: true }
);

// Create compound index for conversation and user to ensure uniqueness
ConversationParticipantSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

export default mongoose.models.ConversationParticipant || model<IConversationParticipant>('ConversationParticipant', ConversationParticipantSchema);