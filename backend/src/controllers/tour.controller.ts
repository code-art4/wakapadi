import { Controller, Get, Post, Body } from '@nestjs/common';
import { TourService } from '../services/tour.service';
import { Tour } from '../schemas/tour.schema';

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  findAll(): Promise<Tour[]> {
    return this.tourService.findAll();
  }

  @Post()
  create(@Body() tour: Partial<Tour>) {
    return this.tourService.create(tour);
  }

  @Post('seed')
  async seedTours(@Body() tours: Partial<Tour>[]) {
    return Promise.all(
      tours.map(async (tour:{title:string}) => {
        const exists = await this.tourService.findByTitle(tour.title);
        if (!exists) {
          return this.tourService.create(tour);
        }
      }),
    );
  }
}
