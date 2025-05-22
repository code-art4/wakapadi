import { Controller, Get, Query} from '@nestjs/common';
import { ScraperService } from '../services/scraper.service';

// @Controller('scraper')
// export class ScraperController {
//   constructor(private readonly scraperService: ScraperService) {}

//   @Get()
//   triggerScraper() {
//     return this.scraperService.scrapeSampleSite();
//   }
// }



@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('freetour')
  scrapeCity(@Query('city') city: string) {
    return this.scraperService.scrapeFreeTourDotCom(city);
  }
}
