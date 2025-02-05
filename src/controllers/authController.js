// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, config.auth.jwt.secret, {
    expiresIn: config.auth.jwt.expiration,
  });
};

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (request, h) => {
  try {
    const { username, password } = request.payload;

    // 1. Validate required fields
    if (!username || !password) {
      return h.response({ message: 'Username and password are required.' }).code(422);
    }

    // 2. Validate email format
    if (!isValidEmail(username)) {
      return h.response({ message: 'Invalid email format.' }).code(400);
    }

    // 3. Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return h.response({ message: 'Account already exists with this email.' }).code(409);
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    const token = generateToken(newUser);
    // 5. Create the user
    await User.create({ username, password: hashedPassword });

    return h.response({ message: 'User registered successfully', token }).code(201);
  } catch (error) {
    console.error('Registration error:', error);
    return h.response({ message: 'User registration failed.', error: error.message }).code(500);
  }
};

// User login
export const login = async (request, h) => {
  try {
    const { username, password } = request.payload;
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
    // Check details
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }
    // Generate JWT token
    const token = generateToken(user);

    return h.response({ message: 'Logged in successfully', token }).code(200);
  } catch (error) {
    console.error('Login error:', error);
    return h.response({ message: 'Login failed.', error: error.message }).code(500);
  }
};

export const logout = (request, h) => {
  try {
  //request.cookieAuth.clear();
  return h.response({ message: 'Logged out successfully' }).code(200);
  } catch(e) {
    console.log('Error occured during logout. ' + e)
    return h.response({ message: e }).code(500);
  }
};

// Get a user by username
export const getUserByUsername = async (request, h) => {
  const { username } = request.params;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    return h.response({ user }).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(400);
  }
};