// src/whois/whois.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhoisPresence } from '../schemas/whois.schema';
import { WhoisMessage } from '../schemas/whois-message.schema';
import { User } from '../schemas/user.schema'; // adjust path if needed

@Injectable()
export class WhoisService {
//   constructor(@InjectModel(WhoisPresence.name) private readonly whoisModel: Model<WhoisPresence>) {}
  constructor(
    @InjectModel(WhoisPresence.name) private readonly whoisModel: Model<WhoisPresence>,
    @InjectModel(WhoisMessage.name) private readonly messageModel: Model<WhoisMessage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  
  async pingPresence(userId: string, data: Partial<WhoisPresence>) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    const normalizedCity = data.city?.trim().toLowerCase() || 'unknown';

    return this.whoisModel.findOneAndUpdate(
      { userId },
      { ...data, city: normalizedCity, expiresAt, visible: true },
      { upsert: true, new: true }
    );
  }

  async hidePresence(userId: string) {
    return this.whoisModel.findOneAndUpdate({ userId }, { visible: false });
  }

  async getNearby(city: string, isAuthenticated?: boolean) {
    const visibleUsers = await this.whoisModel.find({ city, visible: true });
  
    return Promise.all(
      visibleUsers.map(async (user) => {
        const base = {
          _id: user._id,
          city: user.city,
            status: user.status,
            coordinates: user.coordinates,
            lastSeen: user.expiresAt, // or user.updatedAt or a new `lastPingedAt` field
          
        };
  
        if (!isAuthenticated) {
          return {
            ...base,
            anonymous: true,
          };
        }
  
        const foundUser = await this.userModel.findById(user.userId).lean();
  
        return {
          ...base,
          userId: foundUser?._id.toString(),
          username: foundUser?.username || 'User',
        };
      })
    );
  }
  

  async getChatHistory(currentUserId: string, peerUserId: string) {
    return this.messageModel
      .find({
        $or: [
          { from: currentUserId, to: peerUserId },
          { from: peerUserId, to: currentUserId },
        ],
      })
      .sort({ createdAt: 1 });
  }
  
  async markMessagesAsRead(fromUserId: string, toUserId: string) {
    return this.messageModel.updateMany(
      { from: fromUserId, to: toUserId, read: false },
      { $set: { read: true } }
    );
  }
  
  
}
