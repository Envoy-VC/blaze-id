import { type EncryptResponse } from '@lit-protocol/types';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { z } from 'zod';
import { env } from '~/env';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const storageRouter = createTRPCRouter({
  upload: publicProcedure
    .input(z.object({ data: z.string() }))
    .mutation(async ({ input }) => {
      const { data } = input;
      const storage = new ThirdwebStorage({
        secretKey: env.TW_SECRET_KEY,
      });
      const uri = await storage.upload(data);
      return uri;
    }),
  resolve: publicProcedure
    .input(z.object({ uri: z.string() }))
    .mutation(async ({ input }) => {
      const { uri } = input;
      const storage = new ThirdwebStorage({
        secretKey: env.TW_SECRET_KEY,
      });
      const data = await storage.downloadJSON(uri);
      return data as EncryptResponse;
    }),
});
