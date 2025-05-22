import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Presence, PresenceDocument } from '../schemas/presence.schema';

@Injectable()
export class WhoisService {
  constructor(@InjectModel(Presence.name) private presenceModel: Model<PresenceDocument>) {}

  async ping(userId: string, username: string, lat: number, lng: number) {
    return this.presenceModel.findOneAndUpdate(
      { userId },
      { username, lat, lng, lastSeen: new Date() },
      { upsert: true, new: true },
    );
  }

  async findNearby(lat: number, lng: number, radiusKm = 10) {
    const EARTH_RADIUS = 6371; // km

    const kmToRadians = (km: number) => km / EARTH_RADIUS;

    return this.presenceModel.find({
      lat: { $exists: true },
      lng: { $exists: true },
      lastSeen: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // active within 15 min
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], kmToRadians(radiusKm)],
        },
      },
    });
  }
}
