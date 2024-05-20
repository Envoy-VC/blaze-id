import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

import { didRouter } from './routers';

export const appRouter = createTRPCRouter({
  did: didRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
