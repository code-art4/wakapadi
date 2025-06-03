// src/geolocation/geolocation.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeolocationService {
  async reverseGeocode(lat: string, lon: string): Promise<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your@email.com)',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch location data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
