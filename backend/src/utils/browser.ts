// utils/browser.ts
export async function launchBrowser() {
    const isProd = process.env.NODE_ENV === 'production';
    const puppeteer = await import(isProd ? 'puppeteer-core' : 'puppeteer');
  
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: isProd ? '/usr/bin/chromium' : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    });
  
    return browser;
  }
  