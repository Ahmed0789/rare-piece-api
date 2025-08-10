import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScrapedSneakers = sequelize.define('ScrapedSneaker', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: DataTypes.STRING,
    price: DataTypes.STRING,
    sku: DataTypes.STRING,
    link: DataTypes.STRING,
    releaseDate: DataTypes.DATE,
    imageBlob: {
      type: DataTypes.TEXT('long'), // base64 string
      allowNull: true,
    },
    imageFileName: {
      type: DataTypes.STRING, // optional: store filename if saving locally
      allowNull: true,
    }
  }, {
    tableName: 'scrapedSneakers',
    timestamps: false, // use true if you want createdAt/updatedAt
    underscored: true, // to match snake_case in the DB
  });

export default ScrapedSneakers;
