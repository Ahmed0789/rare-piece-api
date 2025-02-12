import { register, login, logout, getUserById } from '../controllers/authController.js';
import { applyReseller, updateUserProfile } from '../controllers/userController.js'

export default [
  {
    method: 'POST', path: '/register', handler: register,
    options: {
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
    }
  },
  {
    method: 'POST', path: '/login', handler: login,
    options: {
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
    }
  },
  {
    method: 'POST', path: '/logout', handler: logout,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    }
  },
  {
    method: 'GET', path: '/profile', handler: getUserById,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    },
  },
  {
    method: 'PUT', path: '/profile', handler: updateUserProfile, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    },
  },
  {
    method: 'POST', path: '/reseller/apply', handler: applyReseller, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
      },
    },
  }
];