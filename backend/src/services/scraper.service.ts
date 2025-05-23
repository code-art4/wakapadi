/// src/scraper/scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TourService } from '../services/tour.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private readonly tourService: TourService) {}

  private readonly cities = [
    'berlin',
    'barcelona',
    'paris',
    'rome',
    'amsterdam',
    'budapest',
    'prague',
    'milan',
    'london',
    'athens'
  ];

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runScheduledScraping() {
    this.logger.log('⏰ Scheduled scrape started...');
    for (const city of this.cities) {
      await this.scrapeCity(city);
    }
    this.logger.log('✅ Scheduled scrape complete');
  }

  async scrapeCity(city: string): Promise<void> {
    const url = `https://www.freetour.com/${city}`;
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

      // Optional: take a screenshot for debug
      // await page.screenshot({ path: `screenshot-${city}.png`, fullPage: true });

      // Clean up old scraped tours for this city
      await this.tourService.deleteAllBySource(city, 'scraper');

      // Add new scraped tours
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
}
