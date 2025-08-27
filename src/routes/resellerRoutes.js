import { populateSneakersTable, scrapeSneakersData, saveScrapedImages } from '../controllers/sneakersController.js';

export default [
  { method: 'GET', path: '/populateSneakers', handler: populateSneakersTable, options: { auth: false, tags: ['api', 'admin']  } },
  {
    method: 'POST',
    path: '/scrape/sneakers-data/nike',
    handler: scrapeSneakersData,
    options: { auth: false, tags: ['api', 'admin'] }
  }
];