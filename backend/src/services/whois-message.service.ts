// src/whois/whois-message.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhoisMessage } from '../schemas/whois-message.schema';
import { WhoisGateway } from '../gateways/whois.gateway';



@Injectable()
export class WhoisMessageService implements OnModuleInit {
  constructor(
    @InjectModel(WhoisMessage.name)
    private readonly messageModel: Model<WhoisMessage>,
    private readonly gateway: WhoisGateway,
  ) {}

  onModuleInit() {}

  async sendMessage(fromUserId: string, toUserId: string, message: string) {
    const newMessage = await this.messageModel.create({ fromUserId, toUserId, message });
    const leanMessage = newMessage.toObject();

    this.gateway.emitToUser(toUserId, 'message:new', {
      fromUserId,
      message,
      sentAt: leanMessage.createdAt,
    });
console.log("messaging")
    return newMessage;
  }

  async getConversation(userId: string, otherUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
   
    
    const filter = {
      $or: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    };
  
    const [messages, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUserId', 'username avatar')
        .populate('toUserId', 'username avatar'),
      this.messageModel.countDocuments(filter),
    ]);
  
    await this.messageModel.updateMany(
      { fromUserId: otherUserId, toUserId: userId, read: false },
      { $set: { read: true } }
    );
  
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      messages: messages.map((msg) => ({
        _id: msg._id,
        text: msg.message,
        fromUserId: msg.fromUserId._id,
        toUserId: msg.toUserId._id,
        createdAt: msg.createdAt,
        read: msg.read,
        // fromUsername: msg.fromUserId.username,
        // toUsername: msg.toUserId.username,
        // fromAvatar: msg.fromUserId.avatar,
        // toAvatar: msg.toUserId.avatar,
      })),
    };
    
  }
  

  async getInbox(userId: string) {
    return this.messageModel.aggregate([
      { $match: { $or: [ { fromUserId: userId }, { toUserId: userId } ] } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: {
            $cond: [
              { $eq: ['$fromUserId', userId] }, '$toUserId', '$fromUserId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } }
    ]);
  }

  async getUnreadCount(userId: string) {
    return this.messageModel.countDocuments({ toUserId: userId, read: false });
  }
}