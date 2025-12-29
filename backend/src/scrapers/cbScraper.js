const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const scrapeCB = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://carsandbids.com/', { waitUntil: 'networkidle2' });

    const cars = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.auction-item')).map((el, i) => ({
        id: `cb-p-${i}`,
        year: parseInt(el.querySelector('.title')?.innerText.split(' ')[0]) || 2024,
        make: el.querySelector('.title')?.innerText.split(' ')[1] || "Unknown",
        model: el.querySelector('.title')?.innerText.split(' ').slice(2).join(' ') || "Car",
        currentBid: parseInt(el.querySelector('.current-bid')?.innerText.replace(/[^0-9]/g, '')) || 0,
        origin: 'Cars & Bids',
        tag: 'Euro',
        imageUrl: el.querySelector('img')?.src || ''
      }));
    });

    await browser.close();
    return cars;
  } catch (err) {
    if (browser) await browser.close();
    return [];
  }
};