import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { generateToken, tokenBlacklist } from '../helpers/jwt/jwt-gen-token.js';
import ResellerRequest from '../models/resellerRequestModel.js';

export const backupAndResetUsers = async () => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Ensure backup table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Users_Backup LIKE Users;
    `, { transaction });

    // 2. Copy data from Users to Users_Backup
    await sequelize.query(`
      INSERT INTO Users_Backup SELECT * FROM Users;
    `, { transaction });

    // 3. Reset Users table (truncate)
    await sequelize.query(`TRUNCATE TABLE Users;`, { transaction });

    await transaction.commit();
    return { success: true, message: 'User table reset successfully. Backup created.' };
  } catch (error) {
    await transaction.rollback();
    throw new Error('Failed to reset user table: ' + error.message);
  }
};

// Admin Login
export const adminLogin = async (request, h) => {
  try {
    const { username, password } = request.payload;

    const admin = await Admin.findOne({ where: { username } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return h.response({ message: 'Invalid admin credentials' }).code(401);
    }

    const token = generateToken(admin, true);
    return h.response({ message: 'Admin logged in successfully', token }).code(200);
  } catch (error) {
    return h.response({ message: 'Admin login failed.', error: error.message }).code(500);
  }
};

export const adminLogout = (request, h) => {
  try {
  //request.cookieAuth.clear();
  const token = request.headers.authorization?.split(' ')[1];
  if (token) {
    tokenBlacklist.add(token);
  }
  return h.response({ message: 'Admin User Logged out successfully' }).code(200);
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

export const verifyReseller = async (request, h) => {
  try {
    const { request_id, status } = request.payload;

    if (!['approved', 'rejected'].includes(status)) {
      return h.response({ message: 'Invalid status' }).code(400);
    }

    const resellerRequest = await ResellerRequest.findByPk(request_id);
    if (!resellerRequest) return h.response({ message: 'Request not found' }).code(404);

    resellerRequest.status = status;
    resellerRequest.completed = true;
    await resellerRequest.save();

    if (status === 'approved') {
      await User.update({ reseller_verified: true }, { where: { id: resellerRequest.user_id } });
    }

    return h.response({ message: 'Reseller status updated' }).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};