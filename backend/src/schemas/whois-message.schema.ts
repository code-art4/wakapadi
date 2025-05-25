// src/whois/whois-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class WhoisMessage extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  fromUserId: mongoose.Types.ObjectId;

 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  toUserId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: Date.now })
  sentAt: Date;


  createdAt: Date
}

export const WhoisMessageSchema = SchemaFactory.createForClass(WhoisMessage);
