import { Module } from '@nestjs/common';
import { ScraperService } from '../services/scraper.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TourModule } from './tour.module';
import { ScraperController } from '../controllers/scraper.controller';

@Module({
  imports: [TourModule, ScheduleModule.forRoot()],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
