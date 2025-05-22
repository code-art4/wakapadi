import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tour, TourDocument } from '../schemas/tour.schema';

@Injectable()
export class TourService {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  async create(data: Partial<Tour>): Promise<Tour> {
    const newTour = new this.tourModel(data);
    return newTour.save();
  }

  async findAll(location?: string): Promise<Tour[]> {
    if (location) {
      return this.tourModel.find({ location: new RegExp(location, 'i') }).exec();
    }
    return this.tourModel.find().exec();
  }  

  async findByTitle(title: string): Promise<Tour | null> {
    return this.tourModel.findOne({ title }).exec();
  }
}

