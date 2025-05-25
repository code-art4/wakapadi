// src/whois/whois.controller.ts
import { Controller, Get, Post, Delete, Body, Req, UseGuards, Query, Param } from '@nestjs/common';
import { WhoisService } from '../services/whois.service';
import { AuthGuard } from '../gateways/auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('whois')
export class WhoisController {
  constructor(private readonly whoisService: WhoisService) {}

  @Post('ping')
  @UseGuards(AuthGuard)
  async ping(@Body() body, @Req() req: AuthRequest) {
    return this.whoisService.pingPresence(req.user!.id, body);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async hide(@Req() req: AuthRequest) {
    return this.whoisService.hidePresence(req.user!.id);
  }

  @Get('nearby')
async nearby(@Req() req: AuthRequest) {
  const city = req.query.city as string;
  const isAuthenticated = !!req.user;
  return this.whoisService.getNearby(city, isAuthenticated);
}


  
  @UseGuards(AuthGuard)
  @Get('chat/:userId')
  async getChat(@Param('userId') userId: string, @Req() req: AuthRequest) {
    return this.whoisService.getChatHistory(req.user!.id, userId);
  }
  
  @UseGuards(AuthGuard)
  @Post('chat/:userId/read')
  async markAsRead(@Param('userId') userId: string, @Req() req: AuthRequest) {
    return this.whoisService.markMessagesAsRead(userId, req.user!.id);
  }
  
}


