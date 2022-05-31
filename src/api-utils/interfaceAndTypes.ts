export interface CustomRequestThis {
  requiredCapabilities: Array<number>;
}

export enum CAPABILITIES {
  USER_ACTIONS = 1,
  GAMEDEV_ACTIONS,
  ADMIN_ACTIONS,
}

export interface GoogleAuthCredentials {
  provider: 'google';
  query: any;
  token: string;
  expiresIn: number;
  profile: {
    id: string;
    displayName: string;
    name: {
      given_name: string;
      family_name: string;
    };
    email: string;
    raw: {
      sub: string;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      email: string;
      email_verified: boolean;
      locale: string;
    };
  };
}
