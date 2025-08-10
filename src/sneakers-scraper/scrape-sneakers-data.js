// scrapeNike.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export async function scrapeNikeWithImages() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('https://www.nike.com/w/mens-shoes-nik1zy7ok', {
    waitUntil: 'domcontentloaded' //'networkidle2',
  });

  // Wait for product cards to load
  await page.waitForSelector('.product-card');

  // Evaluate DOM in browser context
  const sneakers = await page.evaluate(() => {
    const cards = document.querySelectorAll('.product-card');
    const products = [];

    cards.forEach((card) => {
      const name = card.querySelector('.product-card__title')?.innerText || '';
      const price = card.querySelector('.product-price')?.innerText || '';
      const link = card.querySelector('a')?.href || '';
      const imgEl = card.querySelector('img');
      const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

      products.push({
        name,
        price,
        link,
        image,
      });
    });

    return products;
  });

  // for (const sneaker of sneakers) {
  //   const filename = await downloadImage(sneaker.image);
  //   if (filename) {
  //     sneaker.image = `/sneakers/${filename}`; // Update to point to your local image
  //   }
  // }

  await browser.close();
  return sneakers;
}

async function scrapeNikeSneakers() {
  const url = 'https://www.nike.com/w/mens-shoes-nik1zy7ok'; // Example
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const sneakers = [];

  $('.product-card').each((_, el) => {
    sneakers.push({
      name: $(el).find('.product-card__titles').text().trim(),
      price: $(el).find('.product-price').text().trim(),
      image: $(el).find('.product-card__hero-image').attr('src'),
      link: $(el).find('a').attr('href'),
    });
  });

  return sneakers;
}

async function scrapeAdidasSneakers() {
  const url = 'https://www.nike.com/w/mens-shoes-nik1zy7ok'; // Example
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const sneakers = [];

  $('.product-card').each((_, el) => {
    sneakers.push({
      name: $(el).find('.product-card__title').text().trim(),
      price: $(el).find('.product-price').text().trim(),
      image: $(el).find('img').attr('src'),
      link: $(el).find('a').attr('href'),
    });
  });

  return sneakers;
}

export { scrapeNikeSneakers, scrapeAdidasSneakers };