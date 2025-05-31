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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
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
  
async scrapeSingleTour(city: any, tourSlug: any): Promise<any> {
      const url = `https://www.freetour.com/${city}/${tourSlug}`;
    let browser;
  console.log("url", url)
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

        // Wait for critical elements to load
        // await page.waitForSelector('.tour-header', { timeout: 5000 }).catch(() => console.log('Tour header not found'));
        // await page.waitForSelector('.tour-description', { timeout: 5000 }).catch(() => console.log('Description not found'));

        // Extract all the required data
        const tourData = await page.evaluate(() => {
            // Helper function to safely get text content
            const getText = (selector: string) => 
                document.querySelector(selector)?.textContent?.trim() || null;

            // Helper function to get multiple elements
            const getList = (selector: string) => 
                Array.from(document.querySelectorAll(selector)).map(el => el.textContent?.trim());

            const getImages = (selector: string) => 
                Array.from(document.querySelectorAll(selector)).map(el => el.getAttribute("src"));
              
              const getBrPointText = (selector: string) => {
                  const el = document.querySelector(selector);
                  if (!el) return null;
              
                  return Array.from(el.childNodes)
                      .map(node => {
                          if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim();
                          if (node.nodeName === 'br') return '\n';
                          return (node as HTMLElement).innerText?.trim(); // Handle nested elements
                      })
                      .join('')
                      .split('\n')
                      .map(line => line.trim())
                      .filter(Boolean); // remove empty lines
              };
                          // Extract JSON-LD structured data if available
            let structuredData = null;
            
            const ldJson = document.querySelector('script[type="application/ld+json"]');
            if (ldJson) {
                try {
                    structuredData = JSON.parse(ldJson.textContent || '');
                } catch (e) {
                    console.error('Error parsing structured data', e);
                }
            }

            // Extract tour ID from the page
            const tourIdMatch = window.location.pathname.match(/\/(\d+)\//);
            const tourId = tourIdMatch ? tourIdMatch[1] : null;

            return {
                title: getText('h1.tour-title'),
                tourRating: getText('.tour-rating__count'),
                description: getText('.tour-block__text'),
                mainImage: getImages('.tour-gallery__item img'),
                details: getList('.tour-details__info-value'),
                provider:{
                  name: getText(".tour-company__link"),
                  url: document.querySelector(".tour-company__link")?.getAttribute("href") 
                },
                activities: getList(".tour-list li"),
                takeNote: getBrPointText(".tour-text"),
                tourType: getText('.tour-type'),
                tourMap: document.querySelector(".tour-maps a")?.getAttribute("href"),
            };
        });

        return tourData;

    } catch (error) {
        console.error(`Error scraping tour ${tourSlug} in ${city}:`, error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }}
}

// Example usage:
// scrapeSingleTour('rome', 'ancient-rome-walking-tour')
//   .then(data => console.log(data))
//   .catch(err => console.error(err));
