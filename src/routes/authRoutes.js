import { register, login, logout, getUserByUsername } from '../controllers/authController.js';

export default [
  { method: 'POST', path: '/register', handler: register, options: { auth: false } },
  { method: 'POST', path: '/login', handler: login, options: { auth: false } },
  { method: 'POST', path: '/logout', handler: logout },
  { method: 'GET', path: '/user/{username}', handler: getUserByUsername },
];