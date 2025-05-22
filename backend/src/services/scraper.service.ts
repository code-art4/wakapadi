// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import { TourService } from './tour.service';

// @Injectable()
// export class ScraperService {
//   private readonly logger = new Logger(ScraperService.name);

//   constructor(private readonly tourService: TourService) {}

//   async scrapeSampleSite(): Promise<void> {
//     const url = 'https://example.com/free-tours'; // Replace with real URL

//     try {
//       const response = await axios.get(url);
//       const html = response.data;
//       const $ = cheerio.load(html);

//       const tourCards = $('.tour-card').toArray();

//       for (const element of tourCards) {
//         const title = $(element).find('.title').text().trim();
//         const location = $(element).find('.location').text().trim();
//         const recurringSchedule = $(element).find('.schedule').text().trim();

//         if (!title || !location) {
//           this.logger.warn('Skipping incomplete tour entry');
//           continue;
//         }

//         const existingTour = await this.tourService.findByTitle(title);

//         if (!existingTour) {
//           await this.tourService.create({
//             title,
//             location,
//             recurringSchedule,
//             sourceUrl: url,
//           });

//           this.logger.log(`Saved new tour: ${title} in ${location}`);
//         } else {
//           this.logger.debug(`Skipped existing tour: ${title}`);
//         }
//       }
//     } catch (error) {
//       this.logger.error('Scraping failed:', error.message);
//     }
//   }
// }



// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import { TourService } from './tour.service';

// @Injectable()
// export class ScraperService {
//   private readonly logger = new Logger(ScraperService.name);

//   constructor(private readonly tourService: TourService) {}

//   async scrapeFreeTourDotCom(city: string): Promise<void> {
//     const url = `https://www.freetour.com/${city}`;


    
//     try {
//       const response = await axios.get(url);
//       const $ = cheerio.load(response.data);
//             console.log("response", response)
//       const tourCards = $('.tours-list').toArray(); // .tour-item holds each tour
//       for (const el of tourCards) {
//         const title = $(el).find('.tour-title').text().trim();
//         const time = $(el).find('.tour-time').text().trim(); // May include schedule
//         const location = city.charAt(0).toUpperCase() + city.slice(1); // e.g. 'Berlin'

//         if (!title) continue;

//         const existing = await this.tourService.findByTitle(title);
//         if (!existing) {
//           await this.tourService.create({
//             title,
//             location,
//             recurringSchedule: time,
//             sourceUrl: url,
//           });
//           console.log("city 1", city)
//           this.logger.log(`✔ Scraped: ${title}`);
//         } else {
//             console.log("city 2", city)
//           this.logger.debug(`⏩ Already exists: ${title}`);
//         }
//       }
//     } catch (err) {
//         console.log("city 3", city)
//       this.logger.error(`Failed to scrape FreeTour.com for ${city}`, err.message);
//     }
//   }
// }




// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import { TourService } from './tour.service';

// @Injectable()
// export class ScraperService {
//   private readonly logger = new Logger(ScraperService.name);

//   constructor(private readonly tourService: TourService) {}

//   async scrapeFreeTourDotCom(city: string): Promise<void> {
//     const url = `https://www.freetour.com/api/tours?location=${city}&limit=20&offset=0`;

//     try {
//       const response = await axios.get(url);
//       const tours = response.data?.data ?? [];

//       for (const tour of tours) {
//         const title = tour.title;
//         const time = tour.schedule?.join(', ') ?? 'Recurring';
//         const location = tour.city?.name || city;

//         const exists = await this.tourService.findByTitle(title);
//         if (!exists) {
//           await this.tourService.create({
//             title,
//             location,
//             recurringSchedule: time,
//             sourceUrl: `https://www.freetour.com/${city}`,
//           });

//           this.logger.log(`✔ Saved: ${title}`);
//         } else {
//           this.logger.debug(`⏩ Already exists: ${title}`);
//         }
//       }
//     } catch (err) {
//       this.logger.error(`Failed to fetch API for ${city}`, err.message);
//     }
//   }
// }


// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import { TourService } from './tour.service';

// @Injectable()
// export class ScraperService {
//   private readonly logger = new Logger(ScraperService.name);
//   private readonly BASE_URL = 'https://www.freetour.com';

//   constructor(private readonly tourService: TourService) {}

//   async scrapeFreeTourDotCom(city: string): Promise<void> {
//     // FreeTour.com uses city names in lowercase with hyphens for spaces
//     const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
//     const url = `${this.BASE_URL}/${formattedCity}`;
//     try {
//       const headers = {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//       };

//       this.logger.log(`Fetching tours from: ${url}`);
//       const response = await axios.get(url, { 
//         headers,
//         timeout: 10000, // 10 seconds timeout
//       });

//       if (response.status !== 200) {
//         throw new Error(`Received status code ${response.status}`);
//       }

//       const $ = cheerio.load(response.data);

//       // Check if we're on a "city not found" page
//       if ($('h1').text().toLowerCase().includes('not found')) {
//         throw new Error(`City ${city} not found on FreeTour.com`);
//       }

//       // Updated selectors based on current FreeTour.com structure
//       const tourCards = $('.nearest-tours').toArray();
//       console.log("url", tourCards)

//       if (tourCards.length === 0) {
//         this.logger.warn(`No tours found for ${city}. The page structure might have changed.`);
//         // Log the first 500 characters of the page for debugging
//         this.logger.debug(`Page content snippet: ${response.data.substring(0, 500)}`);
//         return;
//       }

//       for (const el of tourCards) {
//         const title = $(el).find('.tour-title, .title, h3, h4').text().trim();
//         const time = $(el).find('.tour-duration, .duration, .time').text().trim() || 'Not specified';
//         const price = $(el).find('.price-value, .price, .tour-price').text().trim() || 'Free';
//         const rating = $(el).find('.rating-value, .rating, .tour-rating').text().trim() || 'Not rated';
        
//         // Get the individual tour URL
//         const tourLink = $(el).find('a[href*="/tour/"]').attr('href');
//         const fullTourUrl = tourLink ? `${this.BASE_URL}${tourLink}` : url;

//         if (!title) {
//           this.logger.debug(`Skipping item with no title`);
//           continue;
//         }

//         try {
//           const existing = await this.tourService.findByTitle(title);
//           if (!existing) {
//             await this.tourService.create({
//               title,
//               location: city.charAt(0).toUpperCase() + city.slice(1),
//               recurringSchedule: time,
//             //   price,
//             //   rating,
//               sourceUrl: fullTourUrl,
//             });
//             this.logger.log(`✔ Successfully saved: ${title}`);
//           } else {
//             this.logger.debug(`⏩ Already exists: ${title}`);
//           }
//         } catch (dbError) {
//           this.logger.error(`Database error for tour "${title}": ${dbError.message}`);
//         }
//       }
//     } catch (err) {
//       this.logger.error(`Failed to scrape FreeTour.com for ${city}`, err.message);
//       if (err.response) {
//         this.logger.debug(`Response status: ${err.response.status}`);
//         this.logger.debug(`Response headers: ${JSON.stringify(err.response.headers)}`);
//       }
//       throw new Error(`Scraping failed for ${city}: ${err.message}`);
//     }
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { TourService } from './tour.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private readonly tourService: TourService) {}

  async scrapeFreeTourDotCom(city: string): Promise<void> {
    const url = `https://www.freetour.com/${city.toLowerCase()}`;
    this.logger.log(`Starting scrape for ${city} at ${url}`);

    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true, // Use the new headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Useful for some environments
      });
      const page = await browser.newPage();
      
      // Set a realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Configure page behavior
      await page.setViewport({ width: 1366, height: 768 });
      await page.setJavaScriptEnabled(true);

      // Navigate with more options and timeout
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });

      if (!response.ok()) {
        throw new Error(`Failed to load page: HTTP ${response.status()}`);
      }

      // Wait for the main content to load
      await page.waitForSelector('.tour-item, .search-results, .tours-list', { 
        timeout: 10000 
      }).catch(() => {
        this.logger.warn('Main tour items selector not found, proceeding anyway');
      });

      const tours = await page.evaluate(() => {
        // Try different selectors - the website might have changed
        const cardSelectors = [
          '.tour-item',
          '.tour-card',
          '.tours-list li',
          '.search-results .item'
        ];
        
        let cards: Element[] = [];
        
        // Try each selector until we find one that works
        for (const selector of cardSelectors) {
          const found = document.querySelectorAll(selector);
          if (found.length > 0) {
            cards = Array.from(found);
            break;
          }
        }
        return cards.map((el) => {
          // More flexible selectors with fallbacks
          const title = el.querySelector('.tour-title, .title, h3, h4')?.textContent?.trim() || '';
          const time = el.querySelector('.tour-time, .duration, .time')?.textContent?.trim() || '';
          const link = (el.querySelector('a[href]') as HTMLAnchorElement)?.href || '';
          const img = (el.querySelector('img[src]') as HTMLImageElement)?.src || '';
          
          return { title, time, link, image: img };
        }).filter(tour => tour.title && tour.link); // Only return tours with title and link
      });

      if (!tours.length) {
        this.logger.warn(`No tours found on page for ${city}`);
        // Consider taking a screenshot for debugging
        await page.screenshot({ path: `debug-${city}-${Date.now()}.png` });
        return;
      }

      this.logger.log(`Found ${tours.length} tours for ${city}`);

      // Save tours to database
      for (const tour of tours) {
        try {
          const exists = await this.tourService.findByTitle(tour.title);
          if (!exists) {
            await this.tourService.create({
              title: tour.title,
              location: city,
              recurringSchedule: tour.time,
              sourceUrl: url,
              externalPageUrl: tour.link,
              image: tour.image,
            });
            this.logger.log(`✔ Saved: ${tour.title}`);
          } else {
            this.logger.debug(`⏩ Skipped (exists): ${tour.title}`);
          }
        } catch (dbError) {
          this.logger.error(`Database error for ${tour.title}: ${dbError.message}`);
        }
      }

    } catch (err) {
      this.logger.error(`❌ Error scraping ${city}: ${err.message}`);
      // Take screenshot on error
      if (browser) {
        const page = await browser.newPage();
        await page.screenshot({ path: `error-${city}-${Date.now()}.png` });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
