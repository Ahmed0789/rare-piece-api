import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

const TrustedDevice = sequelize.define('TrustedDevice', {
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
    device_fingerprint: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Unique device identifier'
    },
    device_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User-friendly device name'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address when device was trusted'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/device user agent'
    },
    trusted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'When device was marked as trusted'
    },
    last_used: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time this device was used'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this trusted device is still active'
    }
}, {
    tableName: 'trusted_devices',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['device_fingerprint'] },
        { fields: ['is_active'] }
    ]
});

TrustedDevice.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TrustedDevice, { foreignKey: 'user_id' });

export default TrustedDevice;