import Hapi from '@hapi/hapi';
import { config } from '../config/index.js';
import { configureAuth } from '../plugins/authStrategy.js';
import authRoutes from '../routes/authRoutes.js';
import sequelize from '../config/database.js';
import sneakerRoutes from '../routes/sneakerRoutes.js';
import Jwt from '@hapi/jwt';
import RateLimit from 'hapi-rate-limit';

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
  
  // Register plugins
  await server.register([Jwt, RateLimit]);
  // Define JWT authentication strategy
  server.auth.strategy('jwt', 'jwt', {
    keys: config.auth.jwt.secret,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 86400, // 24 hours
    },
    validate: async (artifacts, request, h) => {
      return { isValid: true, credentials: { userId: artifacts.decoded.payload.id } };
    },
  });

  // Set JWT as the default authentication method
  server.auth.default('jwt');

  // Register auth strategy
  //await configureAuth(server);

  // Register routes
  server.route([...authRoutes, ...sneakerRoutes]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();