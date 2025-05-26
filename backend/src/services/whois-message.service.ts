// src/services/whois-message.service.ts
import { Injectable, OnModuleInit, NotFoundException, Inject, forwardRef } from '@nestjs/common'; // Add Inject, forwardRef
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WhoisMessage } from '../schemas/whois-message.schema';
import { WhoisGateway } from '../gateways/whois.gateway';
import { User } from '../schemas/user.schema'; // Correct import for User schema

// --- REVISED INTERFACE ---
interface PopulatedMessageLean {
  _id: Types.ObjectId;
  fromUserId: { _id: Types.ObjectId; username: string; avatarUrl?: string };
  toUserId: { _id: Types.ObjectId; username: string; avatarUrl?: string };
  message: string;
  read: boolean;
  createdAt: Date;
  reactions: Array<{ emoji: string; fromUserId: Types.ObjectId }>;
  updatedAt?: Date;
}
// --- END REVISED INTERFACE ---


@Injectable()
export class WhoisMessageService implements OnModuleInit {
  constructor(
    @InjectModel(WhoisMessage.name)
    private readonly messageModel: Model<WhoisMessage>,
    @Inject(forwardRef(() => WhoisGateway)) // <--- Apply forwardRef here
    private readonly gateway: WhoisGateway,
  ) {}

  onModuleInit() {}

  async sendMessage(fromUserId: string, toUserId: string, message: string) {
    const newMessage = await this.messageModel.create({ fromUserId, toUserId, message });
  
    const populatedMessage = (await this.messageModel.findById(newMessage._id)
      .populate('fromUserId', 'username avatarUrl')
      .populate('toUserId', 'username avatarUrl')
      .lean()) as PopulatedMessageLean | null;
  
    if (!populatedMessage) {
      console.error('Failed to populate message after creation. Message ID:', newMessage._id);
      throw new NotFoundException('Message not found after creation and population.');
    }
  
    const commonMessagePayload = {
      _id: populatedMessage._id.toString(),
      fromUserId: populatedMessage.fromUserId._id.toString(),
      toUserId: populatedMessage.toUserId._id.toString(),
      message: populatedMessage.message,
      createdAt: populatedMessage.createdAt.toISOString(),
      read: populatedMessage.read,
      username: populatedMessage.fromUserId.username,
      avatar: populatedMessage.fromUserId.avatarUrl || 'default_avatar.jpg',
      reactions: populatedMessage.reactions || [],
    };
  
    // Only emit to the conversation room, not directly to users
    const roomName = [fromUserId, toUserId].sort().join('-');
    this.gateway.server.to(roomName).emit('message:new', commonMessagePayload);
  
    // Still send notification separately if needed
    this.gateway.emitToUser(toUserId, 'notification:new', {
      type: 'chat',
      from: fromUserId,
      text: message,
      timestamp: Date.now(),
    });
  
    return newMessage;
  }

  async addReaction(messageId: string, fromUserId: string, emoji: string) {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found.`);
    }

    const existingReactionIndex = message.reactions.findIndex(r => r.fromUserId.toString() === fromUserId);

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ emoji, fromUserId: new Types.ObjectId(fromUserId) });
    }

    await message.save();

    const targetUser = message.fromUserId.toString() === fromUserId ? message.toUserId.toString() : message.fromUserId.toString();
    this.gateway.emitToUser(targetUser, 'message:reaction', { messageId, reaction: { emoji, fromUserId } });
    this.gateway.emitToUser(fromUserId, 'message:reaction', { messageId, reaction: { emoji, fromUserId } });

    return message;
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
        .populate('fromUserId', 'username avatarUrl')
        .populate('toUserId', 'username avatarUrl')
        .lean<PopulatedMessageLean[]>(),
      this.messageModel.countDocuments(filter),
    ]);

    await this.messageModel.updateMany(
      { fromUserId: otherUserId, toUserId: userId, read: false },
      { $set: { read: true } }
    );

    const readMessageIds = messages
      .filter(msg => msg.fromUserId._id.toString() === otherUserId && msg.toUserId._id.toString() === userId && msg.read === false)
      .map(msg => msg._id.toString());

    if (readMessageIds.length > 0) {
      this.gateway.emitToUser(otherUserId, 'message:read:confirm', { messageIds: readMessageIds });
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      messages: messages.map((msg) => ({
        _id: msg._id.toString(),
        message: msg.message,
        fromUserId: msg.fromUserId._id.toString(),
        toUserId: msg.toUserId._id.toString(),
        createdAt: msg.createdAt.toISOString(),
        read: msg.toUserId._id.toString() === userId ? true : msg.read,
        username: msg.fromUserId.username,
        avatar: msg.fromUserId.avatarUrl || 'default_avatar.jpg',
        reactions: msg.reactions || [],
      })),
    };
  }

  async getInbox(userId: string) {
    return this.messageModel.aggregate([
      { $match: { $or: [ { fromUserId: new Types.ObjectId(userId) }, { toUserId: new Types.ObjectId(userId) } ] } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: {
            $cond: [
              { $eq: ['$fromUserId', new Types.ObjectId(userId)] }, '$toUserId', '$fromUserId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      { $unwind: '$otherUser' },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } }
    ]);
  }

  async getUnreadCount(userId: string) {
    return this.messageModel.countDocuments({ toUserId: userId, read: false });
  }
}