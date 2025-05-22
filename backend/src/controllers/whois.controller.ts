import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PingDto } from '../types/whois.dto';
import { WhoisService } from '../services/whois.service';

@Controller('whois')
export class WhoisController {
  constructor(private readonly whoisService: WhoisService) {}
  @Get()
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.whoisService.findNearby(parseFloat(lat), parseFloat(lng));
  }
  @Post('ping')
ping(@Body() body: PingDto) {
  return this.whoisService.ping(body.userId, body.username, body.lat, body.lng);
}


}
