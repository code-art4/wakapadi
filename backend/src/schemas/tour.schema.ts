import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema()
export class Tour {
  @Prop({ required: true })
  title: string;

  @Prop()
  location: string;

  @Prop() // For specific one-time dates
  date?: string;

  @Prop() // For repeating schedules
  recurringSchedule?: string;

  @Prop()
  sourceUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}


export const TourSchema = SchemaFactory.createForClass(Tour);
