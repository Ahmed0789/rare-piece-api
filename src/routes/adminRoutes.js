import { backupAndResetUsers, adminLogin, adminLogout, getUserByUsername, verifyReseller, adminDisableUser } from '../controllers/adminController.js';
import { markUsersAsRemoved, deleteRemovedUsers } from '../controllers/scheduledTasks.js';

import { isAdmin } from '../middleware/adminAuth.js';
import { createAdminUser } from '../helpers/db/seeder.js';

export default [
    {
        method: 'GET',
        path: '',
        handler: (request, h) => h.redirect('/documentation').code(302)
    },
    {
        method: 'POST', path: '/a-login', handler: adminLogin,
        options: {
            auth: false, // Public route (no authentication required)
            tags: ['api', 'v1', 'admin'],
            plugins: {
                'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
        }
    },
    {
        method: 'POST', path: '/a-logout', handler: adminLogout,
        options: {
            auth: 'jwt',
            tags: ['api', 'v1', 'admin'],
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
            tags: ['api', 'v1', 'admin'],
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 10 requests per minute
            },
        },
    },
    {
        method: 'GET', path: '/admin/get_user_profile/{username}', handler: getUserByUsername,
        options: {
            auth: 'jwt',
            tags: ['api', 'v1', 'admin'],
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
            tags: ['api', 'v1', 'admin'],
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
        }
    },
    {
        method: 'POST',
        path: '/admin/disable-user/{userId}',
        handler: adminDisableUser,
        options: {
            auth: 'jwt',
            pre: [isAdmin],  // Only admins can access
            tags: ['api', 'v1', 'admin'],
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } }, // Limit: 5 requests per minute
            },
            description: 'Disable user account',
            notes: 'Returns success message'
        }
    },
    {
        method: 'POST',
        path: '/tasks/mark-removed',
        options: {
            tags: ['api', 'v1', 'admin'],
            description: 'Scheduled task helper - mark removed=true for accounts disabled for over 28 days',
            notes: 'Runs as part of scheduled task once everyday'
        },
        handler: markUsersAsRemoved
    },
    {
        method: 'POST',
        path: '/tasks/delete-removed-users',
        options: {
            tags: ['api', 'v1', 'admin'],
            description: 'Scheduled task helper - deleted user accounts marked removed=true',
            notes: 'Runs as part of scheduled task once everyday'
        },
        handler: deleteRemovedUsers
    },
    {
        method: 'GET', path: '/health',
        options: {
            tags: ['api', 'v1', 'admin'],           // helps Swagger list the route
            description: 'Health check',
            notes: 'Returns server health status'
        },
        handler: () => ({ status: 'ok' })
    }
];
