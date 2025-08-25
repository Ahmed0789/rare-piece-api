import User from '../models/userModel.js';
import VerificationToken from '../models/verificationToken.js';
import { generateToken } from '../helpers/jwt/jwt-gen-token.js';
import EmailService from '../services/emailService.js';
import SMSService from '../services/smsService.js';
import { getClientIp, generateVerificationCode } from '../utils/clientHelper.js';

// Verify email address
export const verifyEmail = async (request, h) => {
    try {
        const { username, code } = request.payload;
        const currentIp = getClientIp(request);

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }

        // Check if already verified
        if (user.email_verified) {
            return h.response({
                message: 'Email is already verified',
                verified: true
            }).code(200);
        }

        // Find valid verification token
        const verificationToken = await VerificationToken.findOne({
            where: {
                user_id: user.id,
                type: 'email',
                code: code,
                consumed: false
            }
        });

        if (!verificationToken) {
            return h.response({ message: 'Invalid verification code' }).code(400);
        }

        // Check if expired
        if (new Date() > verificationToken.expires_at) {
            return h.response({ message: 'Verification code has expired' }).code(400);
        }

        // Check attempts limit
        if (verificationToken.attempts >= verificationToken.max_attempts) {
            return h.response({
                message: 'Too many failed attempts. Please request a new code.'
            }).code(429);
        }

        // Mark as consumed and update user
        await verificationToken.update({
            consumed: true,
            consumed_at: new Date()
        });

        await user.update({
            email_verified: true,
            email_verified_at: new Date(),
            last_ip: currentIp
        });

        // Generate new token with verified status
        const token = generateToken(user, true);

        return h.response({
            message: 'Email verified successfully',
            verified: true,
            token
        }).code(200);

    } catch (error) {
        console.error('Email verification error:', error);
        return h.response({
            message: 'Email verification failed',
            error: error.message
        }).code(500);
    }
};

// Verify phone number
export const verifyPhone = async (request, h) => {
    try {
        const { username, code } = request.payload;
        const currentIp = getClientIp(request);

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }

        // Check if user has a phone number
        if (!user.phone) {
            return h.response({ message: 'No phone number associated with this account' }).code(400);
        }

        // Check if already verified
        if (user.phone_verified) {
            return h.response({
                message: 'Phone number is already verified',
                verified: true
            }).code(200);
        }

        // Find valid verification token
        const verificationToken = await VerificationToken.findOne({
            where: {
                user_id: user.id,
                type: 'phone',
                code: code,
                consumed: false
            }
        });

        if (!verificationToken) {
            // Increment attempts if token exists
            const existingToken = await VerificationToken.findOne({
                where: {
                    user_id: user.id,
                    type: 'phone',
                    consumed: false
                }
            });

            if (existingToken) {
                await existingToken.increment('attempts');
            }

            return h.response({ message: 'Invalid verification code' }).code(400);
        }

        // Check if expired
        if (new Date() > verificationToken.expires_at) {
            return h.response({ message: 'Verification code has expired' }).code(400);
        }

        // Check attempts limit
        if (verificationToken.attempts >= verificationToken.max_attempts) {
            return h.response({
                message: 'Too many failed attempts. Please request a new code.'
            }).code(429);
        }

        // Mark as consumed and update user
        await verificationToken.update({
            consumed: true,
            consumed_at: new Date()
        });

        await user.update({
            phone_verified: true,
            phone_verified_at: new Date(),
            last_ip: currentIp
        });

        // Generate new token
        const token = generateToken(user, true);

        return h.response({
            message: 'Phone number verified successfully',
            verified: true,
            token
        }).code(200);

    } catch (error) {
        console.error('Phone verification error:', error);
        return h.response({
            message: 'Phone verification failed',
            error: error.message
        }).code(500);
    }
};

// Resend email verification
export const resendEmailVerification = async (request, h) => {
    try {
        const { username } = request.payload;
        const currentIp = getClientIp(request);

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }

        // Check if already verified
        if (user.email_verified) {
            return h.response({
                message: 'Email is already verified',
                sent: false
            }).code(200);
        }

        // Check for recent verification attempts (rate limiting)
        const recentToken = await VerificationToken.findOne({
            where: {
                user_id: user.id,
                type: 'email',
                consumed: false
            },
            order: [['createdAt', 'DESC']]
        });

        // If there's a recent token (less than 1 minute old), don't send new one
        if (recentToken && (new Date() - recentToken.createdAt) < 60000) {
            return h.response({
                message: 'Please wait before requesting another code',
                sent: false
            }).code(429);
        }

        // Invalidate old tokens
        await VerificationToken.update(
            { consumed: true },
            {
                where: {
                    user_id: user.id,
                    type: 'email',
                    consumed: false
                }
            }
        );

        // Generate new verification code
        const emailCode = `${generateVerificationCode(6)}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create new verification token
        await VerificationToken.create({
            user_id: user.id,
            type: 'email',
            code: emailCode,
            expires_at: expiresAt,
            consumed: false,
            ip_address: currentIp
        });

        // Send email
        try {
            await EmailService.sendVerification({
                to: user.username,
                name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                code: emailCode,
                expiresAt
            });

            return h.response({
                message: 'Verification code sent to your email',
                sent: true
            }).code(200);

        } catch (emailError) {
            console.error('Email send failed:', emailError);
            return h.response({
                message: 'Failed to send verification email. Please try again later.',
                sent: false
            }).code(500);
        }

    } catch (error) {
        console.error('Resend email verification error:', error);
        return h.response({
            message: 'Failed to resend verification code',
            error: error.message
        }).code(500);
    }
};

// Resend phone verification
export const resendPhoneVerification = async (request, h) => {
    try {
        const { username } = request.payload;
        const currentIp = getClientIp(request);

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }

        // Check if user has phone
        if (!user.phone) {
            return h.response({ message: 'No phone number associated with this account' }).code(400);
        }

        // Check if already verified
        if (user.phone_verified) {
            return h.response({
                message: 'Phone number is already verified',
                sent: false
            }).code(200);
        }

        // Check for recent verification attempts
        const recentToken = await VerificationToken.findOne({
            where: {
                user_id: user.id,
                type: 'phone',
                consumed: false
            },
            order: [['createdAt', 'DESC']]
        });

        // Rate limiting - 1 minute between requests
        if (recentToken && (new Date() - recentToken.createdAt) < 60000) {
            return h.response({
                message: 'Please wait before requesting another code',
                sent: false
            }).code(429);
        }

        // Invalidate old tokens
        await VerificationToken.update(
            { consumed: true },
            {
                where: {
                    user_id: user.id,
                    type: 'phone',
                    consumed: false
                }
            }
        );

        // Generate new verification code
        const smsCode = `${generateVerificationCode(6)}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create new verification token
        await VerificationToken.create({
            user_id: user.id,
            type: 'phone',
            code: smsCode,
            expires_at: expiresAt,
            consumed: false,
            ip_address: currentIp
        });

        // Send SMS
        try {
            await SMSService.sendVerification({
                to: user.phone,
                code: smsCode,
                expiresAt
            });

            return h.response({
                message: 'Verification code sent to your phone',
                sent: true
            }).code(200);

        } catch (smsError) {
            console.error('SMS send failed:', smsError);
            return h.response({
                message: 'Failed to send verification SMS. Please try again later.',
                sent: false
            }).code(500);
        }

    } catch (error) {
        console.error('Resend phone verification error:', error);
        return h.response({
            message: 'Failed to resend verification code',
            error: error.message
        }).code(500);
    }
};

// Get user's trusted devices
export const getUserTrustedDevices = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;

        const trustedDevices = await TrustedDevice.findAll({
            where: {
                user_id: userId,
                is_active: true
            },
            order: [['trusted_at', 'DESC']],
            attributes: [
                'id',
                'device_name',
                'ip_address',
                'trusted_at',
                'last_used',
                'is_active'
            ]
        });

        return h.response({
            devices: trustedDevices
        }).code(200);

    } catch (error) {
        console.error('Get trusted devices error:', error);
        return h.response({
            message: 'Failed to retrieve trusted devices',
            error: error.message
        }).code(500);
    }
};

// Remove trusted device
export const removeTrustedDevice = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { deviceId } = request.params;

        // Find the device
        const device = await TrustedDevice.findOne({
            where: {
                id: deviceId,
                user_id: userId,
                is_active: true
            }
        });

        if (!device) {
            return h.response({ message: 'Trusted device not found' }).code(404);
        }

        // Mark as inactive instead of deleting (for audit trail)
        await device.update({ is_active: false });

        return h.response({
            message: 'Trusted device removed successfully',
            removed: true
        }).code(200);

    } catch (error) {
        console.error('Remove trusted device error:', error);
        return h.response({
            message: 'Failed to remove trusted device',
            error: error.message
        }).code(500);
    }
};