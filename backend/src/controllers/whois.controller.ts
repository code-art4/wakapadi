import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WhoisService } from '../services/whois.service';

@Controller('whois')
export class WhoisController {
  constructor(private readonly whoisService: WhoisService) {}
  @Get()
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.whoisService.findNearby(parseFloat(lat), parseFloat(lng));
  }
  @Post('ping')
  ping(@Body() body: { userId: string; username: string; lat: number; lng: number }) {
    return this.whoisService.ping(body.userId, body.username, body.lat, body.lng);
  }


}
