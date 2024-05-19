import { server } from '@passwordless-id/webauthn';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

const registrationSchema = z.object({
  username: z.string(),
  credential: z.object({
    id: z.string(),
    publicKey: z.string(),
    algorithm: z.union([z.literal('RS256'), z.literal('ES256')]),
  }),
  authenticatorData: z.string(),
  clientData: z.string(),
  attestationData: z.string().optional(),
});

const verifySchema = z.object({
  registration: registrationSchema,
  expected: z.object({
    challenge: z.string(),
    origin: z.string(),
  }),
});

export const webauthnRouter = createTRPCRouter({
  verify: publicProcedure.input(verifySchema).mutation(async ({ input }) => {
    const { registration, expected } = input;
    const registrationParsed = await server.verifyRegistration(
      registration,
      expected
    );

    return registrationParsed;
  }),
  randomChallenge: publicProcedure.mutation(async () => {
    const nonce = crypto.randomUUID();
    return {
      challenge: nonce,
    };
  }),
});
