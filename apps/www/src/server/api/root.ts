import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

import { didRouter, webauthnRouter } from './routers';

export const appRouter = createTRPCRouter({
  did: didRouter,
  webauthn: webauthnRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
