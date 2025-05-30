import { Body, Controller, Get, Post } from '@nestjs/common';
import { CityService } from '../services/city.services';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post('add')
  async addCities(@Body('cities') cities: string[]) {
    const added = await this.cityService.addCities(cities);
    return { added };
  }

  @Get('all')
  async getAllCities() {
    const cities = await this.cityService.getAllCities();
    return cities;
  }
}