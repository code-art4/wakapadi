/// src/scraper/scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TourService } from '../services/tour.service';
import { CityService } from '../services/city.services';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly tourService: TourService,
    private readonly cityService: CityService,
  ) {}

   @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runScheduledScraping() {
    this.logger.log('⏰ Scheduled scrape started...');
    const cities = await this.cityService.getAllCities();
    for (const city of cities) {
      await this.scrapeCity(city, true);
    }
    this.logger.log('✅ Scheduled scrape complete');
  }

  async scrapeCity(city: string, shouldDelete: boolean): Promise<void> {
    const url = `https://www.freetour.com/${city}?price=0-0`;
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Important for Docker
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // May help in some cases
        '--disable-gpu'
      ],
      executablePath: process.env.CHROME_PATH || undefined // Use system Chrome if available
     });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('.city-tour__title', { timeout: 10000 });

      const tours = await page.evaluate(() => {
        const cards = document.querySelectorAll('.city-tour__title');
        const data: { title: string; time: string; externalPageUrl: string; image: string }[] = [];

        cards.forEach((titleNode) => {
          const card = titleNode.closest('.city-tour') as HTMLElement;
          const title = titleNode.textContent?.trim() ?? '';
          const time = card?.querySelector('.icon-time')?.textContent?.trim() ?? 'Recurring';
          const link = (card?.querySelector('a') as HTMLAnchorElement)?.href || '';
          const img = (card?.querySelector('img') as HTMLImageElement)?.src || '';
          if (title) data.push({ title, time, externalPageUrl: link, image: img });
        });

        return data;
      });

      if (shouldDelete) {
        await this.tourService.deleteAllBySource(city, 'scraper');
      }

      for (const tour of tours) {
        await this.tourService.create({
          title: tour.title,
          location: city,
          recurringSchedule: tour.time,
          sourceUrl: url,
          externalPageUrl: tour.externalPageUrl,
          image: tour.image,
          sourceType: 'scraper',
        });
      }

      this.logger.log(`✔ ${tours.length} tours scraped for ${city}`);
    } catch (err) {
      this.logger.error(`❌ Failed to scrape ${city}: ${err.message}`);
    } finally {
      await browser.close();
    }
  }


  async scrapeNewCityOnce(city: string): Promise<{ added: boolean; message: string }> {
    // Normalize city name for edge cases like "Halle (Saale)"
    const normalizedCity = city.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  
    const exists = await this.cityService.cityExists(normalizedCity);
    if (exists) {
      return { added: false, message: `${normalizedCity} already exists in the database.` };
    }
    await this.cityService.addSingleCity(normalizedCity);
    await this.scrapeCity(normalizedCity, false);
    return { added: true, message: `Scraping complete for new city: ${normalizedCity}` };
  }
  
  async scrapeSingleTour(city: string, tourSlug: string, retries = 3): Promise<any> {
    const url = `https://www.freetour.com/${city}/${tourSlug}`;
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
  
      const page = await browser.newPage();
      
      // Set realistic viewport
      await page.setViewport({ width: 1280, height: 800 });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
      // Enable request interception to block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'script'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
  
      let response;
      try {
        response = await page.goto(url, { 
          waitUntil: 'networkidle2', 
          timeout: 60000 
        });
        
        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()} - ${response.statusText()}`);
        }
      } catch (err) {
        if (retries > 0) {
          this.logger.warn(`Retrying (${retries} left) for ${url}`);
          return this.scrapeSingleTour(city, tourSlug, retries - 1);
        }
        throw err;
      }
  
      // Rest of your scraping logic...
      
    } catch (error) {
      this.logger.error(`Error scraping tour ${tourSlug} in ${city}: ${error.message}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Example usage:
// scrapeSingleTour('rome', 'ancient-rome-walking-tour')
//   .then(data => console.log(data))
//   .catch(err => console.error(err));



// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { TourService } from '../services/tour.service';
// import { CityService } from '../services/city.services';
// import axios from 'axios';
// import * as cheerio from 'cheerio';

// @Injectable()
// export class ScraperService {
//   private readonly logger = new Logger(ScraperService.name);
//   private readonly axiosInstance = axios.create({
//     timeout: 30000,
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//     }
//   });

//   constructor(
//     private readonly tourService: TourService,
//     private readonly cityService: CityService,
//   ) {}

//   @Cron(CronExpression.EVERY_DAY_AT_2AM)
//   async runScheduledScraping() {
//     this.logger.log('⏰ Scheduled scrape started...');
//     const cities = await this.cityService.getAllCities();
//     for (const city of cities) {
//       await this.scrapeCity(city, true);
//     }
//     this.logger.log('✅ Scheduled scrape complete');
//   }

//   async scrapeCity(city: string, shouldDelete: boolean): Promise<void> {
//     const url = `https://www.freetour.com/${city}?price=0-0`;
    
//     try {
//       const response = await this.axiosInstance.get(url);
//       const $ = cheerio.load(response.data);

//       const tours:any = [];
//       $('.city-tour').each((_, element) => {
//         const card = $(element);
//         const title = card.find('.city-tour__title').text()?.trim() || '';
//         if (!title) return;

//         tours.push({
//           title,
//           time: card.find('.icon-time').text()?.trim() || 'Recurring',
//           externalPageUrl: card.find('a').attr('href') || '',
//           image: card.find('img').attr('src') || ''
//         });
//       });

//       if (shouldDelete) {
//         await this.tourService.deleteAllBySource(city, 'scraper');
//       }

//       for (const tour of tours) {
//         await this.tourService.create({
//           title: tour.title,
//           location: city,
//           recurringSchedule: tour.time,
//           sourceUrl: url,
//           externalPageUrl: tour.externalPageUrl,
//           image: tour.image,
//           sourceType: 'scraper',
//         });
//       }

//       this.logger.log(`✔ ${tours.length} tours scraped for ${city}`);
//     } catch (err) {
//       this.logger.error(`❌ Failed to scrape ${city}: ${err.message}`);
//     }
//   }

//   async scrapeNewCityOnce(city: string): Promise<{ added: boolean; message: string }> {
//     const normalizedCity = city.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  
//     const exists = await this.cityService.cityExists(normalizedCity);
//     if (exists) {
//       return { added: false, message: `${normalizedCity} already exists in the database.` };
//     }
//     await this.cityService.addSingleCity(normalizedCity);
//     await this.scrapeCity(normalizedCity, false);
//     return { added: true, message: `Scraping complete for new city: ${normalizedCity}` };
//   }
  
//   async scrapeSingleTour(city: string, tourSlug: string, retries = 3): Promise<any> {
//     const url = `https://www.freetour.com/${city}/${tourSlug}`;
    
//     try {
//       const response = await this.axiosInstance.get(url);
//       const $ = cheerio.load(response.data);

//       const getText = (selector: string) => $(selector).text()?.trim() || null;
//       const getList = (selector: string) => $(selector).map((_, el) => $(el).text()?.trim()).get();
//       const getImages = (selector: string) => $(selector).map((_, el) => $(el).attr('src')).get();

//       const getBrPointText = (selector: string) => {
//         const el = $(selector);
//         if (!el.length) return null;
//         return el.html()?.split('<br>').map(item => item.replace(/<[^>]*>/g, '').trim()).filter(Boolean) || [];
//       };

//       const structuredData = this.parseStructuredData($);
//       const tourMapUrl = $(".tour-maps a").attr('href') || null;
//       const [latitude, longitude] = this.parseCoordinates(tourMapUrl);

//       return {
//         title: getText('h1.tour-title'),
//         tourRating: getText('.tour-rating__count'),
//         description: getText('.tour-block__text'),
//         mainImage: getImages('.tour-gallery__item img'),
//         details: getList('.tour-details__info-value'),
//         provider: {
//           name: getText(".tour-company__link"),
//           url: $(".tour-company__link").attr('href')
//         },
//         activities: getList(".tour-list li"),
//         takeNote: getBrPointText(".tour-text"),
//         tourType: getText('.tour-type'),
//         tourMap: tourMapUrl,
//         latitude,
//         longitude,
//         tourUrl: url,
//         ...structuredData
//       };
//     } catch (error) {
//       if (retries > 0) {
//         this.logger.warn(`Retrying (${retries} left) for ${url}`);
//         return this.scrapeSingleTour(city, tourSlug, retries - 1);
//       }
//       this.logger.error(`Error scraping tour ${tourSlug} in ${city}: ${error.message}`);
//       throw error;
//     }
//   }

//   private parseStructuredData($: cheerio.CheerioAPI): any {
//     try {
//       const ldJson = $('script[type="application/ld+json"]').html();
//       return ldJson ? JSON.parse(ldJson) : null;
//     } catch (e) {
//       this.logger.error('Error parsing structured data', e);
//       return null;
//     }
//   }

//   private parseCoordinates(tourMapUrl: string | null): [number | null, number | null] {
//     if (!tourMapUrl) return [null, null];
//     const match = tourMapUrl.match(/maps\?q=([-.\d]+),([-.\d]+)/);
//     return match ? [parseFloat(match[1]), parseFloat(match[2])] : [null, null];
//   }
// }