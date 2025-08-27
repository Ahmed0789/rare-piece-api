import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Define the User model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  reseller_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether email is verified'
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When email was verified'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'User phone number'
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether phone is verified'
  },
  phone_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When phone was verified'
  },
  last_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Last known IP address'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  mfa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether MFA is enabled for this user'
  }
}, {
  timestamps: false,
  tableName: 'Users',  // Explicitly define table name
});

export default User;
