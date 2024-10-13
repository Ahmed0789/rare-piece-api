import { Sequelize } from 'sequelize';

// const sequelize = new Sequelize('rare-piece-test', 'adminaarian', 'nPassword', {
//   host: 'localhost',
//   dialect: 'mysql',
// });
const sequelize = new Sequelize('RarePieceTest', 'rp-test-user', 'Y(Taz0J)b1o3dpkI', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // Disable logging for production
});

export default sequelize;