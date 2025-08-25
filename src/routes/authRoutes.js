// routes/auth.js
import Joi from 'joi';
import { login, logout, checkUserSession, verifyMFA, resendMFA } from '../controllers/authController.js';

// Joi schemas for Swagger documentation
const loginPayloadSchema = Joi.object({
  username: Joi.string().email().required().description('User email').example('user@example.com'),
  password: Joi.string().min(8).required().description('User password').example('password123'),
  deviceFingerprint: Joi.string().optional().description('Optional device fingerprint for trusted device tracking').example('abc123def456')
}).label('LoginPayload');

const loginResponseSchema = Joi.alternatives().try(
  // Standard login response
  Joi.object({
    message: Joi.string().example('Logged in successfully'),
    token: Joi.string().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
    user: Joi.object({
      id: Joi.number().example(123),
      firstname: Joi.string().example('John'),
      lastname: Joi.string().example('Smith'),
      username: Joi.string().email().example('user@example.com'),
      email_verified: Joi.boolean().example(true)
    })
  }),
  // MFA required response
  Joi.object({
    message: Joi.string().example('MFA verification required'),
    mfaRequired: Joi.boolean().example(true),
    tempToken: Joi.string().example('temp_token_123'),
    availableMethods: Joi.array().items(Joi.string().valid('email', 'sms')).example(['email', 'sms']),
    maskedEmail: Joi.string().example('u***@example.com'),
    maskedPhone: Joi.string().allow(null).example('+1***-***-1234')
  })
).label('LoginResponse');

const mfaVerifyPayloadSchema = Joi.object({
  tempToken: Joi.string().required().description('Temporary token from login response').example('temp_token_123'),
  code: Joi.string().length(6).required().description('6-digit MFA code').example('123456'),
  trustDevice: Joi.boolean().default(false).description('Mark this device as trusted').example(false)
}).label('MFAVerifyPayload');

export default [
  {
    method: 'POST',
    path: '/login',
    handler: login,
    options: {
      auth: false,
      tags: ['api', 'v1', 'auth'],
      description: 'User login with automatic MFA detection based on IP/device',
      notes: 'Returns either a full login token or MFA challenge based on device/IP recognition',
      validate: {
        payload: loginPayloadSchema
      },
      response: {
        schema: loginResponseSchema
      },
      plugins: {
        'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } },
      }
    }
  },
  {
    method: 'POST',
    path: '/mfa/verify',
    handler: verifyMFA,
    options: {
      auth: false,
      tags: ['api', 'v1', 'auth', 'mfa'],
      description: 'Verify MFA code and complete login',
      validate: {
        payload: mfaVerifyPayloadSchema
      },
      response: {
        schema: Joi.object({
          message: Joi.string().example('Login completed successfully'),
          token: Joi.string().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
          user: Joi.object({
            id: Joi.number().example(123),
            firstname: Joi.string().example('John'),
            username: Joi.string().email().example('user@example.com')
          })
        })
      },
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      }
    }
  },
  {
    method: 'POST',
    path: '/mfa/resend',
    handler: resendMFA,
    options: {
      auth: false,
      tags: ['api', 'v1', 'auth', 'mfa'],
      description: 'Resend MFA code',
      validate: {
        payload: Joi.object({
          tempToken: Joi.string().required().example('temp_token_123'),
          method: Joi.string().valid('email', 'sms').required().example('email')
        })
      },
      plugins: {
        'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } },
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/status',
    handler: checkUserSession,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'v1', 'auth'],
      description: 'Check user session and refresh token',
    }
  },
  {
    method: 'POST',
    path: '/logout',
    handler: logout,
    options: {
      auth: 'jwt',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
      },
      tags: ['api', 'v1', 'auth'],
      description: 'Logout user and blacklist token',
    }
  }
];