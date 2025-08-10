import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Define the Sneaker model
const Sneaker = sequelize.define('Sneaker', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    styleID: {
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
    },
    shoeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    silhoutte: {
        type: DataTypes.STRING,
        allowNull: false
    },
    retailPrice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageLinks: {
        type: [String],
        allowNull: false
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    urlKey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false
    },
    goatProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    colorway: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resellLinks: {
        stockX: {
            type: DataTypes.STRING,
        },
        stadiumGoods: {
            type: DataTypes.STRING,
        },
        goat: {
            type: DataTypes.STRING,
        },
        flightClub: {
            type: DataTypes.STRING,
        }
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lowestResellPrice: {
        stockX: {
            type: DataTypes.INTEGER
        },
        stadiumGoods: {
            type: DataTypes.INTEGER
        },
        goat: {
            type: DataTypes.INTEGER
        },
        flightClub: {
            type: DataTypes.INTEGER
        },
    },
    resellPrices: {
        stockX: {},
        goat: {},
        stadiumGoods: {},
        flightClub: {}
    }
}, {
    timestamps: false,
    tableName: 'Sneaker',
});

export default Sneaker;
