
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
      await this.scraperService.scrapeCity(city, true);
      return { message: `Scraped city: ${city}` };
    }

    await this.scraperService.runScheduledScraping();
    return { message: 'Scraped all cities' };
  }

  @Post('new/city')
  async scrapeNewCityOnce(@Body('city') city: string) {
  const tours=  await this.scraperService.scrapeNewCityOnce(city);
  console.log("tours", tours)
    return tours;
  }


  @Post('scrape-tour')
  async getTour(@Body() body: { city: string; slug: string }) {
    return this.scraperService.scrapeSingleTour(body.city, body.slug);
  }
}
