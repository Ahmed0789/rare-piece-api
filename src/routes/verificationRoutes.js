import Joi from 'joi';
import {
    verifyEmail,
    verifyPhone,
    resendEmailVerification,
    resendPhoneVerification,
    getUserTrustedDevices,
    removeTrustedDevice
} from '../controllers/verificationController.js';

// Joi schemas for Swagger documentation
const verifyEmailSchema = Joi.object({
    username: Joi.string().email().required().description('User email').example('user@example.com'),
    code: Joi.string().length(6).required().description('6-digit verification code').example('123456')
}).label('VerifyEmailPayload');

const verifyPhoneSchema = Joi.object({
    username: Joi.string().email().required().description('User email').example('user@example.com'),
    code: Joi.string().length(6).required().description('6-digit verification code').example('123456')
}).label('VerifyPhonePayload');

const resendVerificationSchema = Joi.object({
    username: Joi.string().email().required().description('User email').example('user@example.com')
}).label('ResendVerificationPayload');

const verificationResponseSchema = Joi.object({
    message: Joi.string().example('Email verified successfully'),
    verified: Joi.boolean().example(true),
    token: Joi.string().optional().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
}).label('VerificationResponse');

const trustedDevicesResponseSchema = Joi.object({
    devices: Joi.array().items(
        Joi.object({
            id: Joi.number().example(1),
            device_name: Joi.string().allow(null).example('Chrome on Windows'),
            ip_address: Joi.string().example('192.168.1.1'),
            trusted_at: Joi.date().example('2024-01-15T10:30:00Z'),
            last_used: Joi.date().allow(null).example('2024-01-20T14:22:00Z'),
            is_active: Joi.boolean().example(true)
        })
    )
}).label('TrustedDevicesResponse');

export default [
    {
        method: 'POST',
        path: '/verify/email',
        handler: verifyEmail,
        options: {
            auth: false,
            tags: ['api', 'v1', 'verification'],
            description: 'Verify user email with verification code',
            notes: 'Verifies the email address using the 6-digit code sent during registration',
            validate: {
                payload: verifyEmailSchema
            },
            response: {
                schema: verificationResponseSchema
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    },
    {
        method: 'POST',
        path: '/verify/phone',
        handler: verifyPhone,
        options: {
            auth: false,
            tags: ['api', 'v1', 'verification'],
            description: 'Verify user phone number with verification code',
            notes: 'Verifies the phone number using the 6-digit code sent via SMS',
            validate: {
                payload: verifyPhoneSchema
            },
            response: {
                schema: verificationResponseSchema
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 5, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    },
    {
        method: 'POST',
        path: '/verify/email/resend',
        handler: resendEmailVerification,
        options: {
            auth: false,
            tags: ['api', 'v1', 'verification'],
            description: 'Resend email verification code',
            notes: 'Sends a new verification code to the user email address',
            validate: {
                payload: resendVerificationSchema
            },
            response: {
                schema: Joi.object({
                    message: Joi.string().example('Verification code sent to your email'),
                    sent: Joi.boolean().example(true)
                })
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    },
    {
        method: 'POST',
        path: '/verify/phone/resend',
        handler: resendPhoneVerification,
        options: {
            auth: false,
            tags: ['api', 'v1', 'verification'],
            description: 'Resend phone verification code',
            notes: 'Sends a new verification code to the user phone number via SMS',
            validate: {
                payload: resendVerificationSchema
            },
            response: {
                schema: Joi.object({
                    message: Joi.string().example('Verification code sent to your phone'),
                    sent: Joi.boolean().example(true)
                })
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 3, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    },
    {
        method: 'GET',
        path: '/user/trusted-devices',
        handler: getUserTrustedDevices,
        options: {
            auth: 'jwt',
            tags: ['api', 'v1', 'user', 'security'],
            description: 'Get user trusted devices',
            notes: 'Returns list of devices marked as trusted for MFA bypass',
            response: {
                schema: trustedDevicesResponseSchema
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    },
    {
        method: 'DELETE',
        path: '/user/trusted-devices/{deviceId}',
        handler: removeTrustedDevice,
        options: {
            auth: 'jwt',
            tags: ['api', 'v1', 'user', 'security'],
            description: 'Remove a trusted device',
            notes: 'Removes a device from the trusted devices list, requiring MFA on next login',
            validate: {
                params: Joi.object({
                    deviceId: Joi.number().integer().required().description('Trusted device ID').example(1)
                })
            },
            response: {
                schema: Joi.object({
                    message: Joi.string().example('Trusted device removed successfully'),
                    removed: Joi.boolean().example(true)
                })
            },
            plugins: {
                'hapi-rate-limit': { pathLimit: 10, pathCache: { expiresIn: 60 * 1000 } },
            }
        }
    }
];