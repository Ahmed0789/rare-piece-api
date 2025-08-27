'use strict';

export async function up(queryInterface, Sequelize) {
    // 1) Add new columns to Users table
    await Promise.all([
        queryInterface.addColumn('Users', 'email_verified', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }),
        queryInterface.addColumn('Users', 'email_verified_at', {
            type: Sequelize.DATE,
            allowNull: true,
        }),
        queryInterface.addColumn('Users', 'phone', {
            type: Sequelize.STRING(20),
            allowNull: true,
        }),
        queryInterface.addColumn('Users', 'phone_verified', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }),
        queryInterface.addColumn('Users', 'phone_verified_at', {
            type: Sequelize.DATE,
            allowNull: true,
        }),
        queryInterface.addColumn('Users', 'last_ip', {
            type: Sequelize.STRING(45),
            allowNull: true,
        }),
        queryInterface.addColumn('Users', 'last_login', {
            type: Sequelize.DATE,
            allowNull: true,
        }),
        queryInterface.addColumn('Users', 'mfa_enabled', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        })
    ]);

    // 2) Create verification_tokens table
    await queryInterface.createTable('verification_tokens', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        type: {
            type: Sequelize.ENUM('email', 'phone', 'mfa', 'password_reset'),
            allowNull: false
        },
        code: {
            type: Sequelize.STRING(10),
            allowNull: false
        },
        temp_token: {
            type: Sequelize.STRING(128),
            allowNull: true,
            unique: true
        },
        expires_at: {
            type: Sequelize.DATE,
            allowNull: false
        },
        consumed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        consumed_at: {
            type: Sequelize.DATE,
            allowNull: true
        },
        ip_address: {
            type: Sequelize.STRING(45),
            allowNull: true
        },
        device_fingerprint: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        attempts: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        max_attempts: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    await queryInterface.addIndex('verification_tokens', ['user_id']);
    await queryInterface.addIndex('verification_tokens', ['type']);
    await queryInterface.addIndex('verification_tokens', ['temp_token']);
    await queryInterface.addIndex('verification_tokens', ['expires_at']);
    await queryInterface.addIndex('verification_tokens', ['consumed']);

    // 3) Create trusted_devices table
    await queryInterface.createTable('trusted_devices', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        device_fingerprint: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        device_name: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        ip_address: {
            type: Sequelize.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        trusted_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        last_used: {
            type: Sequelize.DATE,
            allowNull: true
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    await queryInterface.addIndex('trusted_devices', ['user_id']);
    await queryInterface.addIndex('trusted_devices', ['device_fingerprint']);
    await queryInterface.addIndex('trusted_devices', ['is_active']);
}
export async function down(queryInterface, Sequelize) {
    // Drop trusted_devices and verification_tokens
    await queryInterface.dropTable('trusted_devices');
    await queryInterface.dropTable('verification_tokens');

    // Remove added user columns
    await Promise.all([
        queryInterface.removeColumn('Users', 'email_verified'),
        queryInterface.removeColumn('Users', 'email_verified_at'),
        queryInterface.removeColumn('Users', 'phone'),
        queryInterface.removeColumn('Users', 'phone_verified'),
        queryInterface.removeColumn('Users', 'phone_verified_at'),
        queryInterface.removeColumn('Users', 'last_ip'),
        queryInterface.removeColumn('Users', 'last_login'),
        queryInterface.removeColumn('Users', 'mfa_enabled')
    ]);

    // If Postgres - drop enum type
    if (queryInterface.sequelize.getDialect() === 'postgres') {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_verification_tokens_type";');
    }
}