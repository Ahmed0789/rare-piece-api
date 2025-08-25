import { Sequelize } from 'sequelize';

// const sequelize = new Sequelize('rare-piece-test', 'adminaarian', 'nPassword', {
//   host: 'localhost',
//   dialect: 'mysql',
// });
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // Disable logging for production
});

export default sequelize;