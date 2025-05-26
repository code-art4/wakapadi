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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: true,
})
export class WhoisGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    @InjectModel(WhoisMessage.name)
    private readonly messageModel: Model<WhoisMessage>,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string;

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      this.userSockets.set(payload.id, client.id);

      console.log(`✅ User connected: ${payload.id}, socket: ${client.id}`);

      this.server.emit('userOnline', payload.id);
    } catch (err) {
      console.warn('❌ Invalid token - disconnecting socket');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`👋 User disconnected: ${userId}, socket: ${client.id}`);
        this.server.emit('userOffline', userId);
        break;
      }
    }
  }

  public emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }

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

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { to: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };

      const message = await this.messageModel.create({
        fromUserId: payload.id,
        toUserId: data.to,
        message: data.text,
      });

      const fullMsg = message.toObject();

      this.emitToUser(data.to, 'message:new', fullMsg);
      this.emitToUser(payload.id, 'message:new', fullMsg); // Echo back to sender (optional)
      this.emitToUser(data.to, 'notification:new', {
        type: 'chat',
        from: payload.id,
        text: data.text,
        timestamp: Date.now(),
      });
      
    } catch (err) {
      console.error('Error handling message:', err);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };

      this.emitToUser(data.to, 'typing', { fromUserId: payload.id });
    } catch (err) {
      console.warn('Typing event rejected due to auth error');
    }
  }
  
}
