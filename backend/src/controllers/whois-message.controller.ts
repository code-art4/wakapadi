// src/whois/whois-message.controller.ts
import { Controller, Post, Get, Param, Body, Req, UseGuards, Query, Patch } from '@nestjs/common';
import { WhoisMessageService } from '../services/whois-message.service';
import { AuthGuard } from '../gateways/auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: { id: string };
}

@Controller('whois/chat')
@UseGuards(AuthGuard)
export class WhoisMessageController {
  constructor(private readonly messageService: WhoisMessageService) {}

  @Get('inbox') // specific route
  async inbox(@Req() req: AuthRequest) {
    return this.messageService.getInbox(req.user!.id);
  }
  @Post('send')
  async send(@Req() req: AuthRequest, @Body() body: { toUserId: string; message: string }) {
    // While messages are primarily sent via WebSocket for real-time,
    // this endpoint can serve as a fallback or for initial sends.
    return this.messageService.sendMessage(req.user!.id, body.toUserId, body.message);
  }
  @Get('unread-count')
  async unreadCount(@Req() req: AuthRequest) {
    // This endpoint also remains unchanged.
    const count = await this.messageService.getUnreadCount(req.user!.id);
    return { unreadCount: count };
  }
  @Patch('mark-read')
  async markMessagesRead(@Req() req: AuthRequest, @Body() body: { fromUserId: string; messageIds: string[] }) {
    await this.messageService.markMessagesAsRead(req.user!.id, body.fromUserId, body.messageIds);
    return { success: true };
  }
  @Get(':userId') // Changed 'chat/:userId' to just ':userId' for cleaner routing, assuming it's the primary chat thread endpoint
  async getChat(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20'
  ) {
    // This fetches the conversation history, including reactions
    const result = await this.messageService.getConversation(
      req.user!.id,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    return {
      messages: result.messages, // These messages will now include the 'reactions' array and populated user data
      meta: {
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
      }
    };
  }







}