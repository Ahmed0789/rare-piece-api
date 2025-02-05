import { register, login, logout, getUserByUsername } from '../controllers/authController.js';

export default [
  { method: 'POST', path: '/register', handler: register,
    options: {
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
    } 
  },
  { method: 'POST', path: '/login', handler: login,
    options: { 
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
    } 
  },
  { method: 'POST', path: '/logout', handler: logout,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    }
   },
   {
    method: 'GET',
    path: '/profile',
    handler: (request, h) => {
      return h.response({ user: request.auth.credentials }).code(200);
    },
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    },
  },
  { method: 'GET', path: '/user/{username}', handler: getUserByUsername },
];