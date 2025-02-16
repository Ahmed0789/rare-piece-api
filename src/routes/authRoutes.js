import { register, login, logout, checkUserSession, getUserById } from '../controllers/authController.js';
import { applyReseller, checkVerificationStatus, updateUserProfile } from '../controllers/userController.js'

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
  { method: 'GET', path: '/auth/status', handler: checkUserSession,
    options: {
      auth: 'jwt', // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
    }
  },
  {
    method: 'POST', path: '/logout', handler: logout,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
    }
  },
  {
    method: 'GET', path: '/profile', handler: getUserById,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
    },
  },
  {
    method: 'PUT', path: '/profile', handler: updateUserProfile, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
    },
  },
  {
    method: 'POST', path: '/reseller_verification', handler: applyReseller, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
      },
    },
  },
  {
    method: 'GET', path: '/reseller_verification/status', handler: checkVerificationStatus, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
      },
    },
  }
];