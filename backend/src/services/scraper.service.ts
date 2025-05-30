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
  


  async scrapeSingleTohur(city: string, tourSlug: string): Promise<any> {
    const url = `https://www.freetour.com/${city}/${tourSlug}`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // try {
    //   await page.goto(url, { waitUntil: 'domcontentloaded' });
    //   await page.waitForSelector('h1', { timeout: 10000 });

    //   const tourDetails = await page.evaluate(() => {
    //     const title = document.querySelector('.tour-title')?.textContent?.trim() ?? '';
    //     const description = document.querySelector('[data-tour-description]')?.textContent?.trim() ?? '';
    //     const image = document.querySelector('.tour-gallery__item')?? '';
    //     const duration = document.querySelector('.icon-time')?.textContent?.trim() ?? '';
    //     const img = (document?.querySelector('img') as HTMLImageElement)?.src || '';
    //     // tour-gallery__item
    //     const highlights = Array.from(document.querySelectorAll('.icon-check-circle + span'))
    //       .map(el => el.textContent?.trim()).filter(Boolean);
    //       console.log("document", document)

    //     return { title, description, image, duration, highlights, img };
    //   });


    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('main', { timeout: 10000 });

      const tour = await page.evaluate(() => {
        const cards = document.querySelectorAll('.main');
        const data: { title: string; time: string; externalPageUrl: string; image: string }[] = [];

        cards.forEach((titleNode) => {
          const card = titleNode.closest('.city-tour') as HTMLElement;
          const title = titleNode.textContent?.trim() ?? '';
          const time = card?.querySelector('.icon-time')?.textContent?.trim() ?? 'Recurring';
          const link = (card?.querySelector('a') as HTMLAnchorElement)?.href || '';
          const img = (card?.querySelector('img') as HTMLImageElement)?.src || '';
          if (title) data.push({ title, time, externalPageUrl: link, image: img});
        });

        return {data};
      });

      return { success: true, data: tour };
    } catch (error) {
      this.logger.error(`❌ Failed to scrape tour ${city}/${tourSlug}: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      await browser.close();
    }
  }




// // Assuming you have a logger, replace this with your actual logger

// async scrapeSingleTour(cityl: any, tourSluhg: any): Promise<any> {


//     const url = `https://www.freetour.com/${city}/${city}`;

//     let browser; // Declare browser outside try block to ensure it's accessible in finally
//     try {
//         browser = await puppeteer.launch({ headless: true }); // true for production, false for debugging
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Increase timeout for slower pages

//         // // Wait for a key element to ensure the page is fully loaded before scraping
//         // // Consider waiting for a more specific element if 'h1' is not always reliable for full page load
//         // await page.waitForSelector('.tour-details-wrapper', { timeout: 15000 });

//         // const tourDetails = await page.evaluate(() => {
//             const getCleanText = (selector: string) => {
//                 const element = document.querySelector(selector);
//                 return element ? element.textContent?.trim() ?? '' : '';
//             };

//         //     const getAttribute = (selector: string, attr: string) => {
//         //         const element = document.querySelector(selector);
//         //         return element ? element.getAttribute(attr) ?? '' : '';
//         //     };

//         //     const getAllCleanTexts = (selector: string) => {
//         //         return Array.from(document.querySelectorAll(selector))
//         //             .map(el => el.textContent?.trim())
//         //             .filter(Boolean);
//         //     };

//         //     const title = getCleanText('h1.tour-title'); // More specific selector for title
//             const description = getCleanText('[data-tour-description]');
//         //     const mainImage = getAttribute('.tour-main-image img', 'src');

//         //     // --- Tour Overview/Key Info ---
//         //     const duration = getCleanText('.icon-time + span');
//         //     const languages = getCleanText('.icon-globe + span'); // Assuming this pattern for languages
//         //     const tourType = getCleanText('.icon-star-outline + span'); // Often indicates if it's "Free Tour" or "Paid"

//         //     // --- Highlights / What to Expect ---
//         //     const highlights = getAllCleanTexts('.icon-check-circle + span');

//         //     // --- Meeting Point ---
//         //     let meetingPoint: any = {};
//         //     const meetingPointElement = document.querySelector('.meeting-point-section');
//         //     if (meetingPointElement) {
//         //         meetingPoint.address = getCleanText('.meeting-point-section .address-text');
//         //         meetingPoint.description = getCleanText('.meeting-point-section .meeting-point-description');
//         //         meetingPoint.mapLink = getAttribute('.meeting-point-section .map-link', 'href');
//         //         // You might find more specific map coordinates or embedded map data
//         //     }

//         //     // --- Inclusions & Exclusions ---
//         //     const inclusions = getAllCleanTexts('.include-list li'); // Check for specific classes if available
//         //     const exclusions = getAllCleanTexts('.exclude-list li'); // Check for specific classes if available

//         //     // --- Good to Know / Important Info ---
//         //     let goodToKnow: any = {};
//         //     const goodToKnowSection = document.querySelector('.good-to-know-section');
//         //     if (goodToKnowSection) {
//         //         goodToKnow.cancellationPolicy = getCleanText('.cancellation-policy-text'); // Specific selector if present
//         //         goodToKnow.accessibility = getCleanText('.accessibility-info-text'); // Specific selector if present
//         //         goodToKnow.whatToBring = getAllCleanTexts('.what-to-bring-list li'); // Example, adjust selector
//         //         // Look for sections like 'Important Information', 'Tips', etc.
//         //         goodToKnow.generalInfo = getAllCleanTexts('.good-to-know-section .info-item p'); // Generic, refine this
//         //     }

//         //     // --- Tour Schedule / Availability ---
//         //     // This is often dynamic and harder to scrape with static selectors.
//         //     // You might need to look for specific script tags that initialize calendars or schedules.
//         //     // For now, we'll try to get text-based schedules if available.
//         //     const scheduleText = getCleanText('.tour-schedule-info'); // Placeholder, needs specific inspection

//         //     // --- Guide Information ---
//         //     let guideInfo: any = {};
//         //     const guideSection = document.querySelector('.guide-info-section');
//         //     if (guideSection) {
//         //         guideInfo.name = getCleanText('.guide-info-section .guide-name');
//         //         guideInfo.profileLink = getAttribute('.guide-info-section .guide-profile-link', 'href');
//         //         guideInfo.bio = getCleanText('.guide-info-section .guide-bio');
//         //         guideInfo.image = getAttribute('.guide-info-section .guide-image img', 'src');
//         //     }

//         //     // --- Reviews and Ratings (Summary) ---
//         //     let reviewsSummary: any = {};
//         //     const ratingElement = document.querySelector('.overall-rating-value');
//         //     if (ratingElement) {
//         //         reviewsSummary.averageRating = ratingElement.textContent?.trim();
//         //         reviewsSummary.numberOfReviews = getCleanText('.number-of-reviews-text'); // Adjust selector
//         //     }
//         //     // To get individual reviews, you'd need to iterate through a list of review elements
//         //     // e.g., Array.from(document.querySelectorAll('.review-item')).map(reviewEl => { /* extract review details */ });

//         //     // --- Price (for paid tours, if applicable) ---
//         //     // Freetour.com primarily free, but some might have 'suggested price' or paid options
//         //     const suggestedPrice = getCleanText('.suggested-price-text'); // Placeholder
//         //     const currency = getCleanText('.price-currency'); // Placeholder

//         //     // --- Tour ID (often in URL or data attribute) ---
//         //     const tourId = document.querySelector('[data-tour-id]')?.getAttribute('data-tour-id') ?? '';


//             // Attempt to extract structured data (JSON-LD)
//             let structuredData: any = null;
//             const ldJsonScript = document.querySelector('script[type="application/ld+json"]');
//             if (ldJsonScript && ldJsonScript.textContent) {
//                 try {
//                     structuredData = JSON.parse(ldJsonScript.textContent);
//                 } catch (e) {
//                     console.error("Failed to parse JSON-LD:", e);
//                 }
//             }


//             return {
//                 title,
//                 description,
//                 mainImage,
//                 duration,
//                 languages,
//                 tourType,
//                 highlights,
//                 meetingPoint,
//                 inclusions,
//                 exclusions,
//                 goodToKnow,
//                 scheduleText,
//                 guideInfo,
//                 reviewsSummary,
//                 suggestedPrice,
//                 currency,
//                 tourId,
//                 structuredData // Include JSON-LD if found
//             };
//         });

//         console.info(`✅ Successfully scraped tour ${city}/${tourSlug}`);
//         return { success: true, data: tourDetails };
//     } catch (error: any) { // Type 'any' for error to access 'message'
//         console.error(`❌ Failed to scrape tour ${city}/${tourSlug}: ${error.message}`);
//         return { success: false, error: error.message };
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
//}





async scrapeSingleTour(city: any, tourSlug: any): Promise<any> {
      const url = `https://www.freetour.com/${city}/${tourSlug}`;
    let browser;
  console.log("url", url)
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

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
