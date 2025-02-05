import { populateSneakersTable } from '../controllers/sneakersController.js';

export default [
  { method: 'GET', path: '/populateSneakers', handler: populateSneakersTable, options: { auth: false } },
];