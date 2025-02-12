import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResellerRequest = sequelize.define('ResellerRequest', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    id_document: { type: DataTypes.STRING, allowNull: false }, // Stores file path
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

export default ResellerRequest;