import { Profile } from 'passport';

declare global {
  namespace Express {
    interface User extends Profile {
      id: string;
      displayName: string;
      email?: string;
      picture?: string;
    }
  }
}

export {};