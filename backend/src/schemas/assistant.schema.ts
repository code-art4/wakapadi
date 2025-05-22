// assistant.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssistantDocument = Assistant & Document;

@Schema()
export class Assistant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  languages: string[];

  @Prop()
  availability: string; // e.g. "Weekdays only", "Weekends", "Daily 10AM-4PM"

  @Prop()
  experience: string; // short bio or reason for offering help

  @Prop()
  contactMethod: string; // email, WhatsApp, etc.
}

export const AssistantSchema = SchemaFactory.createForClass(Assistant);
