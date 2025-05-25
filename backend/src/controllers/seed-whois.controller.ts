// src/seed/seed-whois.controller.ts
import { Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WhoisPresence } from '../schemas/whois.schema';


@Controller('seed')
export class SeedWhoisController {
  constructor(
    @InjectModel(WhoisPresence.name)
    private readonly presenceModel: Model<WhoisPresence>,
  ) {}

  @Post('whois')
  async seedWhois() {
    await this.presenceModel.deleteMany({ city: 'Berlin' });

    const entries = [
      {
        userId: new Types.ObjectId(),
        username: 'Alice Backpacker',
        city: 'Berlin',
        coordinates: {
          type: 'Point',
          coordinates: [13.4050, 52.5200], // lng, lat
        },
        lastSeen: new Date(),
      },
      {
        userId: new Types.ObjectId(),
        username: 'Bob Explorer',
        city: 'Berlin',
        coordinates: {
          type: 'Point',
          coordinates: [13.3889, 52.5170],
        },
        lastSeen: new Date(),
      },
      {
        userId: new Types.ObjectId(),
        username: 'SoloHiker',
        city: 'Berlin',
        coordinates: {
          type: 'Point',
          coordinates: [11.9601, 51.4536], // lng, lat for Straße der Befreiung
        },
        lastSeen: new Date(),
      },
      {
        userId: new Types.ObjectId(),
        username: 'SoloHiker',
        city: 'Halle',
        coordinates: {
          type: 'Point',
          coordinates: [11.9601, 51.4536], // lng, lat for Straße der Befreiung
        },
        lastSeen: new Date(),
      },
      {
        userId: new Types.ObjectId(),
        username: 'StreetPhotographer',
        city: 'Halle',
        coordinates: {
          type: 'Point',
          coordinates: [11.9601, 51.4537],
        },
        lastSeen: new Date(),
      },
      {
        userId: new Types.ObjectId(),
        username: 'PostcardCollector',
        city: 'Halle',
        coordinates: {
          type: 'Point',
          coordinates: [11.9612, 51.4538],
        },
        lastSeen: new Date(),
      }
      
    ];

    await this.presenceModel.insertMany(entries);

    return { message: 'Seeded Berlin presence', count: entries.length };
  }
}