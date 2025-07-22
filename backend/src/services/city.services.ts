/// Step 2: CityService
// src/services/city.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from '../schemas/city.schema';

@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  private formatCityName(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  async getAllCities(): Promise<string[]> {
    const cities = await this.cityModel.find().exec();
    return cities
      .map((city) => this.formatCityName(city.name))
      .sort((a, b) => a.localeCompare(b));
  }

  async addCities(newCities: string[]): Promise<string[]> {
    const formattedCities = newCities.map(this.formatCityName);
    const existing = await this.cityModel.find({ name: { $in: formattedCities } }).exec();
    const existingNames = new Set(existing.map((c) => c.name));
    
    const toInsert = formattedCities.filter((name) => !existingNames.has(name));

    if (toInsert.length > 0) {
      await this.cityModel.insertMany(toInsert.map((name) => ({ name })));
    }
    
    return toInsert.sort((a, b) => a.localeCompare(b));
  }

  async cityExists(name: string): Promise<boolean> {
    const formattedName = this.formatCityName(name);
    const count = await this.cityModel.countDocuments({ name: formattedName }).exec();
    return count > 0;
  }

  async addSingleCity(name: string): Promise<boolean> {
    const formattedName = this.formatCityName(name);
    const exists = await this.cityExists(formattedName);
    if (!exists) {
      await this.cityModel.create({ name: formattedName });
      return true;
    }
    return false;
  }
}

