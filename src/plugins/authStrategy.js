import HapiAuthCookie from '@hapi/cookie';
import { config } from '../config/index.js';
import { authConfig } from '../config/auth.js';
import UserModel from '../models/userModel.js';

export const configureAuth = async (server) => {
  await server.register(HapiAuthCookie);

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: config.auth.cookie.name,
      password: config.auth.cookie.password,
      isSecure: config.auth.cookie.isSecure,
      ttl: config.auth.cookie.ttl,
    },
    validateFunc: async (request, session) => {
      const user = await UserModel.findById(session.id);
      if (!user) {
        return { valid: false };
      }
      return { valid: true, credentials: user };
    },
  });

  server.auth.default('session');
};