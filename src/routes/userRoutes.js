import Joi from 'joi';
import { getUserById } from '../controllers/authController.js';
import { register, applyReseller, checkVerificationStatus, updateUserProfile } from '../controllers/userController.js'

// Joi schemas (used for validation + swagger examples)
const registerPayloadSchema = Joi.object({
    firstname: Joi.string().min(1).max(100).required().example('Jane'),
    lastname: Joi.string().min(0).max(100).optional().example('Doe'),
    username: Joi.string().email().required().description('User email (used as username)').example('jane@example.com'),
    password: Joi.string().min(8).required().description('Password (min 8 chars)').example('StrongP@ssw0rd'),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().description('Optional E.164 phone number').example('+15551234567')
}).label('RegisterPayload');

const registerResponseSchema = Joi.object({
    message: Joi.string().example('User registered successfully'),
    token: Joi.string().allow(null).example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
    user: Joi.object({
        id: Joi.number().example(123),
        firstname: Joi.string(),
        lastname: Joi.string().allow(null),
        username: Joi.string().email(),
        email_verified: Joi.boolean().example(false),
        phone: Joi.string().allow(null)
    }).example({
        id: 123,
        firstname: 'Jane',
        lastname: 'Doe',
        username: 'jane@example.com',
        email_verified: false,
        phone: '+15551234567'
    })
}).label('RegisterResponse');

export default [
    {
        method: 'POST',
        path: '/register',
        handler: register,
        options: {
            auth: false,
            tags: ['api', 'v1', 'user'],
            description: 'Register user and send email verification code (and SMS if phone provided)',
            validate: {
                payload: registerPayloadSchema
            },
            response: {
                schema: registerResponseSchema
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } },
                // hapi-swagger will pick up Joi metadata for docs & examples
            }
        }
    },
    {
        method: 'GET',
        path: '/profile',
        handler: getUserById,
        options: {
            auth: 'jwt',
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
            },
            tags: ['api', 'v1', 'user'],
            description: 'Get user by ID',
        },
    },
    {
        method: 'PUT', path: '/profile', handler: updateUserProfile, options: {
            auth: 'jwt',
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
            },
            tags: ['api', 'v1', 'user'],
            description: 'Update user info',
        },
    },
    {
        method: 'POST', path: '/reseller_verification', handler: applyReseller, options: {
            auth: 'jwt',
            plugins: {
                'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
            },
            tags: ['api', 'v1', 'user', 'reseller'],
            description: 'Register reseller',
        },
    },
    {
        method: 'GET', path: '/reseller_verification/status', handler: checkVerificationStatus, options: {
            auth: 'jwt',
            plugins: {
                'hapi-rate-limit': { pathLimit: 4, pathCache: { expiresIn: 60 * 1000 } },
            },
            tags: ['api', 'v1', 'user', 'reseller'],
            description: 'Check reseller registration status',
        },
    }
];