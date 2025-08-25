// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import VerificationToken from '../models/verificationToken.js';
import { getClientIp } from '../utils/clientHelper.js';
import TrustedDevice from '../models/trustedDevice.js';
import { generateToken, tokenBlacklist } from '../helpers/jwt/jwt-gen-token.js';

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get a user by id
export const getUserById = async (request, h) => {
  const id = request.auth.credentials.userId;
  console.log(id, request.auth.credentials.userId)
  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    return h.response({ user }).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(400);
  }
};

const generateMFACode = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTempToken = () => crypto.randomBytes(32).toString('hex');

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local[0]}${'*'.repeat(Math.max(local.length - 2, 1))}${local[local.length - 1]}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return null;
  return phone.replace(/(\+\d{1,3})\d+(\d{4})/, '$1***-***-$2');
};

const isNewDevice = async (userId, currentIp, deviceFingerprint) => {
  // Check if this IP or device has been used before
  const user = await User.findByPk(userId);
  
  // Simple IP-based check (you can enhance this)
  if (user.last_ip === currentIp) {
    return false;
  }

  // Check trusted devices if fingerprint provided
  if (deviceFingerprint) {
    const trustedDevice = await TrustedDevice.findOne({
      where: { user_id: userId, device_fingerprint: deviceFingerprint }
    });
    if (trustedDevice) {
      return false;
    }
  }

  return true;
};

// User login with MFA detection
export const login = async (request, h) => {
  try {
    const { username, password, deviceFingerprint } = request.payload;
    const currentIp = getClientIp(request);

    // Validate payload
    if (!username || !password) {
      return h.response({ message: 'Username and password are required.' }).code(422);
    }

    // Validate email format
    if (!isValidEmail(username)) {
      return h.response({ message: 'Invalid email format.' }).code(400);
    }

    // Find user
    const user = await User.findOne({ where: { username } });

    // Check credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    // Check if email is verified
    if (!user.email_verified) {
      return h.response({ 
        message: 'Please verify your email before logging in.',
        emailVerificationRequired: true 
      }).code(403);
    }

    // Check if MFA is required (new device/IP)
    const requiresMFA = await isNewDevice(user.id, currentIp, deviceFingerprint);

    if (!requiresMFA) {
      // Update last IP and login
      await user.update({ 
        last_ip: currentIp,
        last_login: new Date()
      });

      // Generate JWT token
      const token = generateToken(user, true);

      return h.response({ 
        message: 'Logged in successfully', 
        token, 
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email_verified: user.email_verified
        }
      }).code(200);
    }

    // MFA Required - Generate temporary token and MFA codes
    const tempToken = generateTempToken();
    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store MFA session
    await VerificationToken.create({
      user_id: user.id,
      type: 'mfa',
      code: mfaCode,
      temp_token: tempToken,
      expires_at: expiresAt,
      consumed: false,
      ip_address: currentIp,
      device_fingerprint: deviceFingerprint
    });

    // Determine available MFA methods
    const availableMethods = ['email'];
    if (user.phone && user.phone_verified) {
      availableMethods.push('sms');
    }

    // Send MFA code via email (always available)
    try {
      await EmailService.sendMFACode({
        to: user.username,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        code: mfaCode,
        ipAddress: currentIp,
        expiresAt
      });
    } catch (err) {
      console.error('MFA email send failed:', err);
    }

    // Send SMS if phone is available and verified
    if (user.phone && user.phone_verified) {
      try {
        await SMSService.sendMFACode({
          to: user.phone,
          code: mfaCode,
          expiresAt
        });
      } catch (err) {
        console.error('MFA SMS send failed:', err);
      }
    }

    return h.response({
      message: 'MFA verification required - new device/location detected',
      mfaRequired: true,
      tempToken,
      availableMethods,
      maskedEmail: maskEmail(user.username),
      maskedPhone: maskPhone(user.phone)
    }).code(202);

  } catch (error) {
    console.error('Login error:', error);
    return h.response({ message: 'Login failed.', error: error.message }).code(500);
  }
};

// Verify MFA code
export const verifyMFA = async (request, h) => {
  try {
    const { tempToken, code, trustDevice } = request.payload;
    const currentIp = getClientIp(request);

    // Find MFA verification record
    const mfaRecord = await VerificationToken.findOne({
      where: {
        temp_token: tempToken,
        type: 'mfa',
        consumed: false
      },
      include: [{ model: User }]
    });

    if (!mfaRecord) {
      return h.response({ message: 'Invalid or expired MFA token' }).code(400);
    }

    // Check if expired
    if (new Date() > mfaRecord.expires_at) {
      return h.response({ message: 'MFA code has expired' }).code(400);
    }

    // Verify code
    if (mfaRecord.code !== code) {
      return h.response({ message: 'Invalid MFA code' }).code(400);
    }

    const user = mfaRecord.User;

    // Mark MFA as consumed
    await mfaRecord.update({ consumed: true });

    // Update user's last IP and login time
    await user.update({
      last_ip: currentIp,
      last_login: new Date()
    });

    // If user wants to trust this device, save it
    if (trustDevice && mfaRecord.device_fingerprint) {
      await TrustedDevice.create({
        user_id: user.id,
        device_fingerprint: mfaRecord.device_fingerprint,
        ip_address: currentIp,
        user_agent: request.headers['user-agent'] || null,
        trusted_at: new Date()
      });
    }

    // Generate full access token
    const token = generateToken(user, true);

    return h.response({
      message: 'Login completed successfully',
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email_verified: user.email_verified
      }
    }).code(200);

  } catch (error) {
    console.error('MFA verification error:', error);
    return h.response({ message: 'MFA verification failed', error: error.message }).code(500);
  }
};

// Resend MFA code
export const resendMFA = async (request, h) => {
  try {
    const { tempToken, method } = request.payload;

    // Find MFA record
    const mfaRecord = await VerificationToken.findOne({
      where: {
        temp_token: tempToken,
        type: 'mfa',
        consumed: false
      },
      include: [{ model: User }]
    });

    if (!mfaRecord || new Date() > mfaRecord.expires_at) {
      return h.response({ message: 'Invalid or expired MFA session' }).code(400);
    }

    const user = mfaRecord.User;
    const newCode = generateMFACode();

    // Update the code
    await mfaRecord.update({ code: newCode });

    // Send via requested method
    if (method === 'email') {
      await EmailService.sendMFACode({
        to: user.username,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        code: newCode,
        ipAddress: mfaRecord.ip_address,
        expiresAt: mfaRecord.expires_at
      });
    } else if (method === 'sms' && user.phone && user.phone_verified) {
      await SMSService.sendMFACode({
        to: user.phone,
        code: newCode,
        expiresAt: mfaRecord.expires_at
      });
    } else {
      return h.response({ message: 'Invalid method or phone not verified' }).code(400);
    }

    return h.response({ message: `MFA code resent via ${method}` }).code(200);

  } catch (error) {
    console.error('MFA resend error:', error);
    return h.response({ message: 'Failed to resend MFA code' }).code(500);
  }
};

// Existing functions (updated)
export const logout = (request, h) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      tokenBlacklist.add(token);
    }
    return h.response({ message: 'Logged out successfully' }).code(200);
  } catch(e) {
    console.log('Error occurred during logout: ' + e);
    return h.response({ message: e.message }).code(500);
  }
};

export const checkUserSession = async (request, h) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return h.response({ message: 'Unauthorized' }).code(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return h.response({ message: 'User not found' }).code(404);

    const newToken = generateToken(user, true);

    return h.response({ loggedIn: true, newToken }).code(200);
  } catch (err) {
    return h.response({ loggedIn: false, message: 'Session expired or invalid token' }).code(401);
  }
};