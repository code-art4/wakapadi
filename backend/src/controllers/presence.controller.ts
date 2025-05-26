// src/presence/presence.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PresenceService } from '../services/presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(':userId')
  async getLastSeen(@Param('userId') userId: string) {
    const lastSeen = await this.presenceService.getLastSeen(userId);
    return { lastSeen };
  }
}
