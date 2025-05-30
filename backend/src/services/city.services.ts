/// Step 2: CityService
// src/services/city.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from '../schemas/city.schema';

@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  async getAllCities(): Promise<string[]> {
    const cities = await this.cityModel.find().exec();
    return cities.map((city) => city.name);
  }

  async addCities(newCities: string[]): Promise<string[]> {
    const existing = await this.cityModel.find({ name: { $in: newCities } }).exec();
    const existingNames = new Set(existing.map((c) => c.name));
    const toInsert = newCities.filter((name) => !existingNames.has(name));
    if (toInsert.length > 0) await this.cityModel.insertMany(toInsert.map((name) => ({ name })));
    return toInsert;
  }

  async cityExists(name: string): Promise<boolean> {
    const count = await this.cityModel.countDocuments({ name }).exec();
    return count > 0;
  }

  async addSingleCity(name: string): Promise<boolean> {
    const exists = await this.cityExists(name);
    if (!exists) {
      await this.cityModel.create({ name });
      return true;
    }
    return false;
  }
}