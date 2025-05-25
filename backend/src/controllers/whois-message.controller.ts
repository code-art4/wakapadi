// src/whois/whois-message.controller.ts
import { Controller, Post, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
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

  @Post('send')
  async send(@Req() req: AuthRequest, @Body() body: { toUserId: string; message: string }) {
    return this.messageService.sendMessage(req.user!.id, body.toUserId, body.message);
  }

  @Get('thread/:userId')
  async getThread(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20'
  ) {
    return this.messageService.getConversation(req.user!.id, userId, parseInt(page), parseInt(limit));
  }

  @Get('inbox')
  async inbox(@Req() req: AuthRequest) {
    return this.messageService.getInbox(req.user!.id);
  }

  @Get('unread-count')
  async unreadCount(@Req() req: AuthRequest) {
    const count = await this.messageService.getUnreadCount(req.user!.id);
    return { unreadCount: count };
  }
}
