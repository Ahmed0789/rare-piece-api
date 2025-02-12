import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserProfile = sequelize.define('UserProfile', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    mobile_number: { type: DataTypes.STRING, allowNull: true },
    billing_address: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

export default UserProfile;