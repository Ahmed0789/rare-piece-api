import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

// Function to generate JWT token
export const generateToken = (user, isAdmin = false) => {
    return jwt.sign(
        { id: user.id, username: user.username, isAdmin },
        config.auth.jwt.secret,
        { expiresIn: config.auth.jwt.expiration }
    );
};

export const tokenBlacklist = new Set();