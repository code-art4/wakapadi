// src/whois/whois.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  
  import { Server, Socket } from 'socket.io';
  import * as jwt from 'jsonwebtoken';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { WhoisMessage } from '../schemas/whois-message.schema';
  
  const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
  
  @WebSocketGateway({ cors: true })
  export class WhoisGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private userSockets = new Map<string, string>(); // userId -> socketId
  
    constructor(
      @InjectModel(WhoisMessage.name)
      private readonly messageModel: Model<WhoisMessage>,
    ) {}
  
    handleConnection(client: Socket) {
      const token = client.handshake.query.token as string;
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string };
        this.userSockets.set(payload.id, client.id);
  
        // 🔔 Notify others this user is online
        this.server.emit('userOnline', payload.id);
      } catch (err) {
        client.disconnect(true);
      }
    }
  
    handleDisconnect(client: Socket) {
      for (const [userId, socketId] of this.userSockets.entries()) {
        if (socketId === client.id) {
          this.userSockets.delete(userId);
  
          // 🔕 Notify others this user went offline
          this.server.emit('userOffline', userId);
          break;
        }
      }
    }
  
    /**
     * Emits a socket event to a specific user if they're connected.
     */
    public emitToUser(userId: string, event: string, payload: any) {
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.server.to(socketId).emit(event, payload);
      }
    }
  
    /**
     * When a user reads messages from another user, mark those as read and notify the sender.
     */
    @SubscribeMessage('message:read')
    async handleRead(
      @MessageBody() data: { fromUserId: string; toUserId: string },
      @ConnectedSocket() client: Socket,
    ) {
      await this.messageModel.updateMany(
        { fromUserId: data.fromUserId, toUserId: data.toUserId, read: false },
        { $set: { read: true } },
      );
  
      this.emitToUser(data.fromUserId, 'message:read:confirm', {
        readerId: data.toUserId,
      });
    }
  }
  