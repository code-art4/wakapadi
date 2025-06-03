// src/contact/schemas/contact-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactMessageDocument = ContactMessage & Document;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({
    required: true,
    enum: ['inquiry', 'complaint', 'feedback', 'suggestion', 'other'],
  })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  userId?: string;

  @Prop({ type: Map, of: String })
  meta?: Record<string, any>;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
