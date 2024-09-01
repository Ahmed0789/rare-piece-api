import Hapi from '@hapi/hapi';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { configureAuth } from '../plugins/authStrategy.js';
import authRoutes from '../routes/authRoutes.js';

const init = async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
  });

  // Connect to MongoDB
  mongoose.connect(config.database.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });

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