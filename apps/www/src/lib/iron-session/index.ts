import { type SessionOptions } from 'iron-session';

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  username: '',
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'lit-session',
  cookieOptions: {
    secure: false,
  },
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
