import { register, login, logout, checkUserSession, getUserById } from '../controllers/authController.js';
import { applyReseller, checkVerificationStatus, updateUserProfile } from '../controllers/userController.js'

export default [
  {
    method: 'POST', path: '/v1/register', handler: register,
    options: {
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
      tags: ['api', 'user'],
      description: 'Register user',
    }
  },
  {
    method: 'POST', path: '/v1/login', handler: login,
    options: {
      auth: false, // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
       tags: ['api', 'user'],
       description: 'User login',
    }
  },
  { method: 'GET', path: '/v1/auth/status', handler: checkUserSession,
    options: {
      auth: 'jwt', // Public route (no authentication required)
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
      },
      tags: ['api', 'user'],
      description: 'Check user session',
    }
  },
  {
    method: 'POST', path: '/v1/logout', handler: logout,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'user'],
      description: 'Logout user',
    }
  },
  {
    method: 'GET', path: '/v1/profile', handler: getUserById,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'user'],
      description: 'Get user by ID',
    },
  },
  {
    method: 'PUT', path: '/v1/profile', handler: updateUserProfile, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'user'],
      description: 'Update user info',
    },
  },
  {
    method: 'POST', path: '/v1/reseller_verification', handler: applyReseller, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'user'],
      description: 'Register reseller',
    },
  },
  {
    method: 'GET', path: '/v1/reseller_verification/status', handler: checkVerificationStatus, options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'user'],
      description: 'Check reseller registration status',
    },
  }
];