import type { ServerRoute } from '@hapi/hapi';

export const userRoutes: ServerRoute[] = [
  // Login with Google
  {
    method: 'GET',
    path: '/general/login/google',
    options: {
      description: 'Login into Games API with Google',
      tags: ['api', 'login', 'google'],
    },
    handler: (request, h) => {
      if (!request.auth.isAuthenticated) {
        return `Authentication failed due to: ${request.auth.error.message}`;
      }

      // Perform any account lookup or registration, setup local session,
      // and redirect to the application. The third-party credentials are
      // stored in request.auth.credentials. Any query parameters from
      // the initial request are passed back via request.auth.credentials.query.

      return h.redirect('/home');
    },
  },
];
