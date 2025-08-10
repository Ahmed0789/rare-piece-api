import { populateSneakersTable, scrapeSneakersData, saveScrapedImages } from '../controllers/sneakersController.js';

export default [
  { method: 'GET', path: '/populateSneakers', handler: populateSneakersTable, options: { auth: false } },
  {
    method: 'POST',
    path: '/scrape/sneakers-data/nike',
    handler: scrapeSneakersData,
    options: { auth: false }
  },
  {
    method: 'GET',
    path: '/sneakers/{param*}',
    handler: saveScrapedImages,
    options: { auth: false }
  }
];