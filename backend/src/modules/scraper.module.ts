import { Module } from '@nestjs/common';
import { ScraperService } from '../services/scraper.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TourModule } from './tour.module';
import { ScraperController } from '../controllers/scraper.controller';
import { CityModule } from './city.module';
import { CityService } from 'src/services/city.services';

@Module({
  imports: [CityModule,TourModule, ScheduleModule.forRoot()],
  providers: [ScraperService, CityService],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
