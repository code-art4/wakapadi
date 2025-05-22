import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema({ timestamps: true })
export class Tour {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  recurringSchedule: string;

  @Prop()
  sourceUrl: string;

  @Prop()
  externalPageUrl: string;

  @Prop()
  image: string;
}

export const TourSchema = SchemaFactory.createForClass(Tour);
