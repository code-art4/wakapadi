
// @Controller('scraper')
// export class ScraperController {
//   constructor(private readonly scraperService: ScraperService) {}

//   @Get()
//   triggerScraper() {
//     return this.scraperService.scrapeSampleSite();
//   }
// }


// src/scraper/scraper.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ScraperService } from '../services/scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  async runManualScrape(@Body('city') city?: string) {
    if (city) {
      await this.scraperService.scrapeCity(city);
      return { message: `Scraped city: ${city}` };
    }

    await this.scraperService.runScheduledScraping();
    return { message: 'Scraped all cities' };
  }
}
