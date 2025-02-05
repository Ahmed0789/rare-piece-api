import HapiAuthCookie from '@hapi/cookie';
import { config } from '../config/index.js';

export const configureAuth = async (server) => {
  await server.register(HapiAuthCookie);

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: config.auth.cookie.name,
      password: config.auth.cookie.password,
      isSecure: config.auth.cookie.isSecure,
      isHttpOnly: true,
      ttl: config.auth.cookie.ttl,
    }
  });

  server.auth.default('session');
};