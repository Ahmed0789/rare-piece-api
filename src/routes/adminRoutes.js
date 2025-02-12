import { backupAndResetUsers, adminLogin, adminLogout, getUserByUsername, verifyReseller } from '../controllers/adminController.js';
import { isAdmin } from '../middleware/adminAuth.js';
import { createAdminUser } from '../helpers/db/seeder.js';

export default [
    {
        method: 'POST', path: '/a-login', handler: adminLogin,
        options: {
            auth: false, // Public route (no authentication required)
            plugins: {
                'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
        }
    },
    {
        method: 'POST', path: '/a-logout', handler: adminLogout,
        options: {
            auth: 'jwt',
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
            },
        }
    },
    {
        method: 'GET',
        path: '/admin/seeder++1',
        handler: async (request, h) => {
            try {
                const result = await createAdminUser();
                return h.response(result).code(200);
            } catch (error) {
                return h.response({ message: error.message }).code(500);
            }
        },
    },
    {
        method: 'POST',
        path: '/admin/reset-users---',
        handler: async (request, h) => {
            try {
                const result = await backupAndResetUsers();
                return h.response(result).code(200);
            } catch (error) {
                return h.response({ message: error.message }).code(500);
            }
        },
        options: {
            auth: 'jwt',
            pre: [isAdmin],  // Only admins can access
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
            },
        },
    },
    {
        method: 'GET', path: '/admin/get_user_profile/{username}', handler: getUserByUsername,
        options: {
            auth: 'jwt',
            pre: [isAdmin],  // Only admins can access
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
        }
    },
    {
        method: 'POST', path: '/admin/reseller/verify', handler: verifyReseller,
        options: {
            auth: 'jwt',
            pre: [isAdmin],  // Only admins can access
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
        }
    },

];
