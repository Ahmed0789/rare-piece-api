import Hapi from '@hapi/hapi';
import { config } from '../config/index.js';
import { configureAuth } from '../plugins/authStrategy.js';
import authRoutes from '../routes/authRoutes.js';
import sequelize from '../config/database.js';

const init = async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
  });

  try {
    await sequelize.authenticate();
    console.log('MySQL connection has been established successfully.');
    await sequelize.sync();  // Sync the models to the database
    console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  // Register auth strategy
  await configureAuth(server);

  // Register routes
  server.route(authRoutes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();