export interface CustomRequestThis {
  requiredCapabilities: Array<number>;
}

export enum CAPABILITIES {
  USER_ACTIONS = 1,
  GAMEDEV_ACTIONS,
  ADMIN_ACTIONS,
}
