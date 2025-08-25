import bcrypt from 'bcryptjs';

import User from '../models/userModel.js';
import UserProfile from '../models/userProfile.js';
import VerificationToken from '../models/verificationToken.js';

import ResellerRequest from '../models/resellerRequestModel.js';

import { generateToken } from '../helpers/jwt/jwt-gen-token.js';
import EmailService from '../services/emailService.js';
import SMSService from '../services/smsService.js';

// Controller - register
export async function register(request, h) {
  try {
    const payload = request.payload || {};
    const { firstname, lastname, username, password, phone } = payload;

    // Basic sanity checks (Joi already validates but defensive checks are fine)
    if (!username || !password || !firstname) {
      return h.response({ message: 'firstname, username (email) and password are required.' }).code(422);
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return h.response({ message: 'Account already exists with this email.' }).code(409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Capture client IP (helps later for MFA: store last_ip)
    const last_ip = getClientIp(request);

    // Create user - set email_verified false initially; phone_verified false if phone supplied
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      password: hashedPassword,
      phone: phone || null,
      email_verified: false,
      phone_verified: false,
      last_ip // optional column — ensure your User model has it or persist to profile
    });

    // Create profile record if needed
    await UserProfile.create({ user_id: newUser.id });

    // Generate email verification code and persist it (one approach)
    const emailCode = `${generateVerificationCode(6)}`; // string '123456'
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Persist token in VerificationToken model (or adjust to use your schema)
    await VerificationToken.create({
      user_id: newUser.id,
      type: 'email',
      code: emailCode,
      expires_at: expiresAt,
      consumed: false
    });

    // Send email verification (implement EmailService.sendVerification to format & send)
    try {
      await EmailService.sendVerification({
        to: newUser.username,
        name: `${newUser.firstname || ''} ${newUser.lastname || ''}`.trim(),
        code: emailCode,
        expiresAt
      });
    } catch (err) {
      // log but don't fail the whole registration for transient email issues.
      console.error('Email send failed:', err);
    }

    // If phone provided, send SMS verification (and persist a phone token)
    if (phone) {
      const smsCode = `${generateVerificationCode(6)}`;
      const smsExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await VerificationToken.create({
        user_id: newUser.id,
        type: 'phone',
        code: smsCode,
        expires_at: smsExpiresAt,
        consumed: false
      });
      try {
        await SMSService.sendVerification({
          to: phone,
          code: smsCode,
          expiresAt: smsExpiresAt
        });
      } catch (err) {
        console.error('SMS send failed:', err);
      }
    }

    // Option A: create a JWT token but mark user's email_verified false in token claims.
    // Option B: Do NOT issue a full access token until email is verified.
    // Below we show generating a token but you can remove it if you'd rather block access.
    const token = generateToken({ id: newUser.id, username: newUser.username, email_verified: false });

    // Return success
    return h.response({
      message: 'User registered successfully. A verification code has been sent to your email.',
      token, // optional, remove if you don't want to issue tokens before verification
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        username: newUser.username,
        email_verified: newUser.email_verified,
        phone: newUser.phone
      }
    }).code(201);

  } catch (error) {
    console.error('Registration error:', error);
    return h.response({ message: 'User registration failed.', error: error.message }).code(500);
  }
}

export const applyReseller = async (request, h) => {
  try {
    const user_id = request.auth.credentials.userId;

    const { firstname, lastname, dob, gender, billing_added, id_type, id_document, mobile_number } = request.payload;

    const requestExists = await ResellerRequest.findOne({ where: { user_id, status: 'pending' } });

    if (requestExists) {
      return h.response({ message: 'Reseller request already pending' }).code(400);
    }

    if (firstname && billing_added && id_document) {
      await ResellerRequest.create({ user_id, id_document });
    } else {
      return h.response({ message: 'Invalid, Provide required details and attach an ID document.' }).code(400);
    }

    const existingUser = await User.findOne({ where: { user_id } });
    const existingUserProfile = await UserProfile.findOne({ where: { user_id } });

    if (existingUser && existingUserProfile) {
      existingUser.update({ firstname: firstname, lastname: lastname });
      existingUserProfile.update({ dob: dob, gender: gender, billing_address: billing_added, mobile_number: mobile_number });
    } else {
      return h.response({ message: 'User has not registered.' }).code(422);
    }

    return h.response({ message: 'Reseller request submitted' }).code(201);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};
export const checkVerificationStatus = async (request, h) => {
  try {
    const user_id = request.auth.credentials.id;

    const requestExists = await ResellerRequest.findOne({ where: { user_id, status: 'pending' } });

    if (!requestExists) {
      return h.response({ message: 'Reseller request doesn\'t exist' }).code(404);
    }

    return h.response({ message: 'Reseller request submitted' }).code(302);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};
export const updateUserProfile = async (request, h) => {
  try {
    const user_id = request.auth.credentials.id;
    const { mobile_number, billing_address } = request.payload;

    await UserProfile.update({ mobile_number, billing_address }, { where: { user_id } });

    return h.response({ message: 'Profile updated' }).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};