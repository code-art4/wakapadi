import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assistant, AssistantDocument } from '../schemas//assistant.schema';

@Injectable()
export class AssistantService {
  constructor(@InjectModel(Assistant.name) private assistantModel: Model<AssistantDocument>) {}

  create(data: Partial<Assistant>) {
    const assistant = new this.assistantModel(data);
    return assistant.save();
  }

  findAll(location?: string) {
    if (location) {
      return this.assistantModel.find({ location: new RegExp(location, 'i') }).exec();
    }
    return this.assistantModel.find().exec();
  }

  findById(id: string) {
    return this.assistantModel.findById(id).exec();
  }
}
