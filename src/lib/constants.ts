import type { User } from '@/data/types';

export const STORAGE_KEYS = {
  users: 'mangeki.users',
  session: 'mangeki.session',
  library: (userId: string) => `mangeki.library.${userId}`,
  customTitles: (userId: string) => `mangeki.customTitles.${userId}`,
} as const;

export const DEMO_ACCOUNT: User = {
  id: 'otaku123',
  username: 'otaku123',
  email: 'otaku123@mangeki.app',
  password: 'demo1234',
};
