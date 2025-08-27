// models/VerificationToken.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

const VerificationToken = sequelize.define('VerificationToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('email', 'phone', 'mfa', 'password_reset'),
        allowNull: false,
        comment: 'Type of verification: email, phone, mfa, password_reset'
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: '6-digit verification code'
    },
    temp_token: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true,
        comment: 'Temporary token for MFA sessions'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'When this verification expires'
    },
    consumed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this verification has been used'
    },
    consumed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this verification was consumed'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address when verification was created'
    },
    device_fingerprint: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Device fingerprint for MFA sessions'
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of failed verification attempts'
    },
    max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        comment: 'Maximum allowed attempts before blocking'
    }
}, {
    tableName: 'verification_tokens',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['temp_token'] },
        { fields: ['expires_at'] },
        { fields: ['consumed'] }
    ]
});

VerificationToken.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(VerificationToken, { foreignKey: 'user_id' });

export default VerificationToken;