// src/presence/presence.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class PresenceService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  async getLastSeen(userId: string): Promise<Date | null> {
    const user = await this.userModel.findById(userId).select('updatedAt');
    return user?.updatedAt || null;
  }
}
