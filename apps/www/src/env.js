import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    IRON_SESSION_PASSWORD: z.string().min(1),
    CAPACITY_CREDITS_PK: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    ALCHEMY_RPC_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_WALLETCONNECT_ID: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
