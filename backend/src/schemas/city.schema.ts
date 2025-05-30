import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class City extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}


export const CitySchema = SchemaFactory.createForClass(City);
