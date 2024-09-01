import { login, logout } from '../controllers/authController.js';

export default [
  {
    method: 'POST',
    path: '/login',
    handler: login,
    options: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/logout',
    handler: logout,
  },
];