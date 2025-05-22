import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PresenceDocument = Presence & Document;

@Schema({ timestamps: true })
export class Presence {
    @Prop()
    userId: string;
  
    @Prop()
    username: string;
  
    @Prop()
    lat: number;
  
    @Prop()
    lng: number;
  
    @Prop({ default: Date.now })
    lastSeen: Date;
  
    @Prop()
    location: [number]; // same as lng/lat pair
}

export const PresenceSchema = SchemaFactory.createForClass(Presence);
