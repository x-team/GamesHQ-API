import Bell from '@hapi/bell';
import Boom from '@hapi/boom';
import CatboxMemory from '@hapi/catbox-memory';
import Cookie from '@hapi/cookie';
import { Server } from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import Handlebars from 'handlebars';
import HapiSwagger from 'hapi-swagger';
import Joi from 'joi';

import pkg from '../package.json';

import { getConfig, isProd, logger } from './config';
import { firebasePlugin } from './plugins/firebasePlugin';
import { routes } from './routes';
import { routeToLabel } from './utils/api';

const getServer = () =>
  new Server({
    host: getConfig('HOST'),
    port: getConfig('PORT'),
    cache: [
      {
        name: 'firebase_token_cache',
        provider: {
          constructor: CatboxMemory,
        },
      },
    ],
    routes: {
      response: {
        modify: true,
        options: {
          allowUnknown: false,
          convert: true,
          stripUnknown: { objects: true },
        },
        async failAction(_request, _h, error) {
          logger.error('response error', error);
          throw error;
        },
      },
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'xtu-session-token'],
      },
      validate: {
        headers: Joi.object({
          Authorization: Joi.string().default('Bearer {uuid}').optional(),
        }),
        options: {
          allowUnknown: true,
        },
        async failAction(_request, _h, error) {
          if (isProd()) {
            throw Boom.badRequest(`Invalid request payload input`);
          } else {
            throw error;
          }
        },
      },
    },
  });

export async function getServerWithPlugins() {
  const server = getServer();

  // Validator method is required to provide info about the validation library
  server.validator(Joi);

  if (process.env.ENV !== 'test') {
    /**
     * @description Automatically generate labels for all endpoints with validation for the purpose of automatic types generation on the front-end
     */
    const allLabels = new Map<string, boolean>();
    server.events.on('route', (route) => {
      if (route.path.startsWith('/swaggerui') || route.path.startsWith('/documentation')) {
        return; // skip
      }

      if (!route.settings.response?.schema) {
        if (!isProd() && getConfig('ENV') !== 'test') {
          logger.warn(`Route without a response schema: ${route.method} ${route.path}`);
        }
        return;
      }

      if (!Joi.isSchema(route.settings.response?.schema)) {
        if (!isProd() && getConfig('ENV') !== 'test') {
          logger.warn(`Route response schema is not a Joi schema: ${route.method} ${route.path}`);
        }
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybeALabel = (route.settings.response.schema as any)._flags?.label;
      if (maybeALabel) {
        if (!isProd() && getConfig('ENV') !== 'test') {
          logger.info(
            `Skipping route ${route.method} ${route.path} because it already has a response schema label: ${maybeALabel}`
          );
        }
        allLabels.set(maybeALabel, true);
        return;
      }

      const label = routeToLabel(route) + 'Response';

      if (allLabels.has(label)) {
        throw new Error(`Duplicate label: ${label} for ${route.method} ${route.path}`);
      }
      allLabels.set(label, true);

      route.settings.response.schema = (route.settings.response.schema as Joi.Schema).label(label);
    });
  }

  const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: {
      title: `${pkg.name} Documentation`,
      version: getConfig('BUILD_VERSION'),
    },
    reuseDefinitions: false,
    definitionPrefix: 'useLabel',
    auth: false,
  };

  await server.register([
    { plugin: Inert },
    { plugin: Vision },
    { plugin: Cookie },
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    { plugin: firebasePlugin },
  ]);

  await server.register(Bell);

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: getConfig('GOOGLE_APPLICATION_CLIENT_RANDOM_PASSWORD'),
    clientId: getConfig('GOOGLE_APPLICATION_CLIENT_ID'),
    clientSecret: getConfig('GOOGLE_APPLICATION_CLIENT_SECRET'),
    isSecure: isProd() ? true : false,
    // providerParams: {
    //   display: 'popup',
    // },
    // location: server.info.uri,
  });

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'XTU_GOOGLE',
      password: getConfig('COOKIE_PASSWORD'),
      isSecure: isProd() ? true : false,
      path: '/',
      isSameSite: false,
    },
    redirectTo: false,
  });

  server.views({
    engines: {
      html: Handlebars,
    },
    relativeTo: __dirname,
    path: 'views',
    // helpersPath: 'views/helpers',
  });

  // await server.register(
  //   {
  //     plugin: slackTowerEvents,
  //   },
  //   {
  //     routes: {
  //       prefix: '/integrations/slack',
  //     },
  //   }
  // );

  await server.route(routes);
  // await server.method(methods);
  return server;
}
