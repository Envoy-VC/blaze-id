import {
  LitAbility,
  LitRLIResource,
  RecapSessionCapabilityObject,
} from '@lit-protocol/auth-helpers';
import { SIWE_DELEGATION_URI } from '@lit-protocol/constants';
import { Wallet, ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { z } from 'zod';
import { env } from '~/env';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const litRouter = createTRPCRouter({
  getCapacityDelegationAuthSig: publicProcedure
    .input(
      z.object({
        delegateeAddresses: z.array(z.string()),
        nonce: z.string(),
        expiry: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { delegateeAddresses, nonce, expiry } = input;

      const provider = new ethers.providers.JsonRpcProvider({
        skipFetchSetup: true,
        url: env.ALCHEMY_RPC_URL,
      });
      const wallet = new Wallet(env.CAPACITY_CREDITS_PK, provider);
      const ownerAddr = wallet.address;
      const _domain = 'example.com';
      const _statement = '';
      const _uses = '1000';
      const capacityTokenId = '1321';
      const litResource = new LitRLIResource(capacityTokenId);
      const recapObject = new RecapSessionCapabilityObject({}, []);

      const capabilities = {
        ...(capacityTokenId ? { nft_id: [capacityTokenId] } : {}),
        ...(delegateeAddresses
          ? {
              delegate_to: delegateeAddresses.map((address) =>
                address.startsWith('0x') ? address.slice(2) : address
              ),
            }
          : {}),
        uses: _uses.toString(),
      };

      recapObject.addCapabilityForResource(
        litResource,
        LitAbility.RateLimitIncreaseAuth,
        capabilities
      );

      let siweMessage = new SiweMessage({
        domain: _domain,
        address: ownerAddr,
        statement: _statement,
        uri: SIWE_DELEGATION_URI,
        version: '1',
        chainId: 1,
        nonce: nonce,
        expirationTime: expiry,
      });
      siweMessage = recapObject.addToSiweMessage(siweMessage);

      const messageToSign = siweMessage.prepareMessage();

      let signature = await wallet.signMessage(messageToSign);
      signature = signature.replace('0x', '');

      const authSig = {
        sig: signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: messageToSign,
        address: ownerAddr.replace('0x', '').toLowerCase(),
        algo: null,
      };

      return { litResource, capacityDelegationAuthSig: authSig };
    }),
});
