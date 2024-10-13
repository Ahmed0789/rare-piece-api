// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

export const register = async (request, h) => {
  const { username, password } = request.payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ username, password: hashedPassword });
    return h.response({ message: 'User registered successfully' }).code(201);
  } catch (error) {
    return h.response({ error: 'User registration failed. ' + error }).code(500);
  }
};

export const login = async (request, h) => {
  const { username, password } = request.payload;
  const user = await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return h.response({ message: 'Invalid credentials' }).code(401);
  }

  // Set user session with hapi-auth-cookie
  request.cookieAuth.set({ id: user.id });
  return h.response({ message: 'Logged in successfully' });
};

export const logout = (request, h) => {
  try {
  request.cookieAuth.clear();
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