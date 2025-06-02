// src/schemas/feedback.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema()
export class Feedback {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  response: string;

  @Prop({ required: true, type: Boolean })
  isHelpful: boolean;

  @Prop()
  feedbackText?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
