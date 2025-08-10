import { scrapeNikeWithImages, scrapeNikeSneakers } from '../sneakers-scraper/scrape-sneakers-data.js';
import { cleanNikeSneakersData } from '../utils/cleanScrapedData.js';

export const populateSneakersTable = async (request, h) => {
  try {
    console.log('Resetting sneakers table...');
    await resetSneakersTable();

    console.log('Fetching sneaker data...');
    //const sneakers = await fetchSneakersData();

    console.log('Inserting data into the database...');
    //await insertSneakersData(sneakers);
    return h.response({ message: 'Sneakers table populated successfully.' }).code(200);
  } catch (error) {
    console.error('Error populating sneakers table:', error);
    return h.response({ error: 'Failed to populate sneakers table.' }).code(500);
  }
};
export const resetSneakersTable = async () => { }

export const scrapeSneakersData = async (request, h) => {
  try {
    const sneakers = await scrapeNikeWithImages();
      const cleaned = sneakers.map(cleanNikeSneakersData);
      // await Sneaker.upsert({
      //   name: s.name,
      //   brand: s.brand,
      //   price: s.price,
      //   image_url: s.image_url,
      //   product_url: s.product_url,
      //   source_site: s.source_site,
      //   image_blob: await getImageAsBase64(imageUrl)
      // });

    return h.response({ imported: sneakers.length, data: cleaned }).code(201);
  }
  catch (error) {
    console.error('Error populating sneakers table:', error);
    return h.response({ error: error }).code(500);
  }
}

export const saveScrapedImages = async (request, h) => {
  try {
    const sneakers = await scrapeNikeWithImages();
      const cleaned = sneakers.map(cleanNikeSneakersData);
      // await Sneaker.upsert({
      //   name: s.name,
      //   brand: s.brand,
      //   price: s.price,
      //   image_url: s.image_url,
      //   product_url: s.product_url,
      //   source_site: s.source_site,
      // });

    return h.response({ imported: sneakers.length, data: cleaned }).code(201);
  }
  catch (error) {
    console.error('Error populating sneakers table:', error);
    return h.response({ error: 'Failed to populate sneakers table.' }).code(500);
  }
}