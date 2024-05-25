import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

import { litRouter } from './routers/lit';
import { storageRouter } from './routers/storage';

export const appRouter = createTRPCRouter({
  lit: litRouter,
  storage: storageRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
