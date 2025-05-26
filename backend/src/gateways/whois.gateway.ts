// src/gateways/whois.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,

} from '@nestjs/websockets'; // Use @nestjs/common for Inject and forwardRef
import {
  Inject,        // <--- Add this
  forwardRef,    // <--- Add this
} from "@nestjs/common"
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhoisMessage } from '../schemas/whois-message.schema';
import { WhoisMessageService } from '../services/whois-message.service'; // Import the service

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

@WebSocketGateway({
  cors: {
  
      origin: '*', // Allows all origins - DANGEROUS FOR PRODUCTION!
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
    @Inject(forwardRef(() => WhoisMessageService)) // <--- Apply forwardRef here
    private readonly messageService: WhoisMessageService, // Inject the service
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

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { userId1: string; userId2: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = [data.userId1, data.userId2].sort().join('-');
    client.join(roomName);
    console.log(`Socket ${client.id} joined room: ${roomName}`);
  }

  @SubscribeMessage('message:read')
  async handleRead(
    @MessageBody() data: { fromUserId: string; toUserId: string; messageIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth?.token as string;
    let currentUserId: string;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      currentUserId = payload.id;
    } catch (err) {
      console.warn('Read event rejected due to auth error');
      return;
    }

    if (currentUserId !== data.toUserId) {
        console.warn(`Attempt to mark messages for wrong user. Auth: ${currentUserId}, data.toUserId: ${data.toUserId}`);
        return;
    }

    await this.messageModel.updateMany(
      { _id: { $in: data.messageIds }, toUserId: currentUserId, fromUserId: data.fromUserId, read: false },
      { $set: { read: true } },
    );

    this.emitToUser(data.fromUserId, 'message:read:confirm', {
      readerId: currentUserId,
      messageIds: data.messageIds,
    });
  }


  // src/gateways/whois.gateway.ts (conceptual)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { to: string; message: string; tempId?: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
  
      // Save the message
      const savedMessage = await this.messageService.sendMessage(
        payload.id, 
        data.to, 
        data.message
      );
  
      // The message will be emitted by the service to the conversation room
      // No need for additional emissions here
  
    } catch (error) {
      console.error('Error handling message:', error);
      // Optionally emit error back to client
      client.emit('message:error', { 
        tempId: data.tempId, 
        error: error.message 
      });
    }
  }
  // @SubscribeMessage('message')
  // async handleMessage(
  //   @MessageBody() data: { to: string; message: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   try {
  //     const token = client.handshake.auth?.token as string;
  //     const payload = jwt.verify(token, JWT_SECRET) as { id: string };

  //    const  savedMessage= await this.messageService.sendMessage(payload.id, data.to, data.message);
  //     this.server.to(data.to).emit('message:new', savedMessage);

  //     // IMPORTANT: Emit back to the sender if they are on a different device or for immediate ack
  //     // If the sender is in the same 'conversation' room as the receiver, this might be enough.
  //     // If not, you might need to target the sender's specific socket ID or their own user ID room.
  //     // this.server.to(fromUserId).emit('message:new', savedMessage);
  //   } catch (err) {
  //     console.error('Error handling message:', err);
  //   }
  // }

//   @SubscribeMessage('message')
// async handleMessage(@MessageBody() data: { to: string; message: string }, @ConnectedSocket() client: Socket) {
//   try {
//     const fromUserId = client.handshake.auth.userId; // Or however you get sender ID
//     const savedMessage = await this.messageService.sendMessage(fromUserId, data.to, data.message);

//     console.log("savedMsg", savedMessage)
//     // Emit to the receiver
//     this.server.to(data.to).emit('message:new', savedMessage);

//     // IMPORTANT: Emit back to the sender if they are on a different device or for immediate ack
//     // If the sender is in the same 'conversation' room as the receiver, this might be enough.
//     // If not, you might need to target the sender's specific socket ID or their own user ID room.
//     this.server.to(fromUserId).emit('message:new', savedMessage); // Or client.emit('message:new', savedMessage);
//                                                                   // Or this.server.to(`user-${fromUserId}`).emit(...)
//   } catch (error) {
//     console.error('Error handling message:', error);
//     // Optionally, emit an error back to the client that sent the message
//     // client.emit('message:error', { tempId: data.tempId, error: error.message });
//   }
// }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };

      const roomName = [payload.id, data.to].sort().join('-');
      this.server.to(roomName).emit('typing', { fromUserId: payload.id });

    } catch (err) {
      console.warn('Typing event rejected due to auth error');
    }
  }

  @SubscribeMessage('stoppedTyping')
  async handleStoppedTyping(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };

      const roomName = [payload.id, data.to].sort().join('-');
      this.server.to(roomName).emit('stoppedTyping', { fromUserId: payload.id });
    } catch (err) {
      console.warn('Stopped typing event rejected due to auth error');
    }
  }

  @SubscribeMessage('message:reaction')
  async handleMessageReaction(
    @MessageBody() data: { messageId: string; emoji: string; toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };

      await this.messageService.addReaction(data.messageId, payload.id, data.emoji);

    } catch (err) {
      console.error('Error handling message reaction:', err);
    }
  }
}