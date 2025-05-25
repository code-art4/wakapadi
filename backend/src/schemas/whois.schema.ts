// src/whois/whois.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class WhoisPresence extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  city: string;

  @Prop({
    type: { lat: Number, lng: Number },
    required: true,
  })
  coordinates: { lat: number; lng: number };

  @Prop({ default: true })
  visible: boolean;

  @Prop()
  status?: string;

  @Prop({
    type: {
      instagram: { type: String },
      whatsapp: { type: String },
    },
    default: {},
  })
  socials?: {
    instagram?: string;
    whatsapp?: string;
  };
  @Prop()
  lastSeen: Date;
  @Prop()
  username: string;
  @Prop()
  expiresAt: Date;
}

export const WhoisPresenceSchema = SchemaFactory.createForClass(WhoisPresence);

// Optional TTL index setup
WhoisPresenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
