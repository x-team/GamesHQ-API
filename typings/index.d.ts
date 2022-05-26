import type { Request } from '@hapi/hapi';
declare module '@hapi/hapi' {
  interface Request {
    // TODO: Better typing
    firebaseUser: any;
  }
}
