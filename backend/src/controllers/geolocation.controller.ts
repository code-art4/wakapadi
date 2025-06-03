// src/geolocation/geolocation.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('reverse')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    return this.geolocationService.reverseGeocode(lat, lon);
  }
}
