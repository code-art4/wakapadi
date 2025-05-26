// src/whois/whois-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// Define the Reaction sub-schema
@Schema()
export class Reaction {
  @Prop({ required: true })
  emoji: string; // e.g., "👍", "❤️", "😂"

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  fromUserId: mongoose.Types.ObjectId; // The user who added this reaction
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);

@Schema({ timestamps: true }) // `timestamps: true` automatically adds `createdAt` and `updatedAt`
export class WhoisMessage extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  fromUserId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  toUserId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;
  @Prop()
  createdAt: Date;
  // The 'sentAt' field is redundant if `timestamps: true` is used, as `createdAt` serves the same purpose.
  // I've removed it for cleaner schema design, but if you have a specific reason for it, keep it.
  // @Prop({ default: Date.now })
  // sentAt: Date;

  // New field to store an array of reactions
  @Prop([ReactionSchema]) // This tells Mongoose to store an array of Reaction documents
  reactions: Reaction[];
}

export const WhoisMessageSchema = SchemaFactory.createForClass(WhoisMessage);