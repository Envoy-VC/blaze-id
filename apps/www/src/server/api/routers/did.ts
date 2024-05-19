import { createDID, deleteDID } from '~/lib/veramo';

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const didRouter = createTRPCRouter({
  create: publicProcedure.mutation(async () => {
    const res = await createDID();
    return res;
  }),
  delete: publicProcedure
    .input(z.object({ did: z.string() }))
    .mutation(async ({ input }) => {
      const res = await deleteDID(input.did);
      return res;
    }),
});
