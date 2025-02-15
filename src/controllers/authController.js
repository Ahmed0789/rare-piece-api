// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import UserProfile from '../models/userProfile.js'
import { generateToken, tokenBlacklist } from '../helpers/jwt/jwt-gen-token.js';

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (request, h) => {
  try {
    if (!request.payload?.username) {
      return h.response({ message: 'No Payload, potential misuse to report.' }).code(403);
    }

    const { firstname, lastname, username, password } = request.payload;
    // 1. Validate required fields
    if (!firstname || !username || !password) {
      return h.response({ message: 'firstname, Username (email) and password are required.' }).code(422);
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
    // 5. Create the user
    const newUser = await User.create({ firstname, lastname, username, password: hashedPassword });
    // 6. create new UserProfile
    await UserProfile.create({ user_id: newUser.id });
    // 7. JWT token
    const token = generateToken(newUser, false);
    // Success response with message, jwt token and new user info
    return h.response({ message: 'User registered successfully', token, newUser }).code(201);
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
    const token = generateToken(user, false);

    return h.response({ message: 'Logged in successfully', token, user }).code(200);
  } catch (error) {
    console.error('Login error:', error);
    return h.response({ message: 'Login failed.', error: error.message }).code(500);
  }
};

export const logout = (request, h) => {
  try {
  //request.cookieAuth.clear();
  const token = request.headers.authorization?.split(' ')[1];
  if (token) {
    tokenBlacklist.add(token);
  }
  return h.response({ message: 'Logged out successfully' }).code(200);
  } catch(e) {
    console.log('Error occured during logout. ' + e)
    return h.response({ message: e }).code(500);
  }
};

export const checkUserSession = async (request, h) => {
  try {
    // Extract token from request headers
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return h.response({ message: 'Unauthorized' }).code(401);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return h.response({ message: 'User not found' }).code(404);

    // Generate a new token to extend session
    const newToken = generateToken(user, false);

    return h.response({ loggedIn: true, newToken }).code(200);
  } catch (err) {
    return h.response({ loggedIn: false, message: 'Session expired or invalid token' }).code(401);
  }
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