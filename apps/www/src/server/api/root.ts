import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

import { litRouter } from './routers/lit';

export const appRouter = createTRPCRouter({
  lit: litRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
