import { useCallback, useEffect } from 'react';

import { useLitStore } from '~/lib/stores';

import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import type { AuthMethod, IRelayPKP } from '@lit-protocol/types';
import { compareAsc } from 'date-fns';
import { toast } from 'sonner';

import { getSession, login } from '../iron-session';

export default function useLitAuth() {
  const { client, authClient, authProvider } = useLitStore();

  const fetchMyPKPs = useCallback(
    async (authMethod: AuthMethod): Promise<IRelayPKP[]> => {
      const pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
      return pkps;
    },
    [authClient]
  );

  const createSession = useCallback(
    async (pkpPublicKey: string, authMethod: AuthMethod) => {
      const session = await getSession();
      const isNotExpired =
        compareAsc(new Date(session.expires ?? 1), Date.now()) == 1;
      if (isNotExpired) {
        return {
          sessionSigs: session.sessionSigs,
          expiry: session.expires,
        };
      }
      const expiry = authClient!.litNodeClient.getExpiration();
      const sessionSigs = await authProvider.getSessionSigs({
        pkpPublicKey: pkpPublicKey,
        authMethod,
        sessionSigsParams: {
          chain: 'ethereum',
          resourceAbilityRequests: [
            {
              resource: new LitActionResource('*'),
              ability: LitAbility.LitActionExecution,
            },
          ],
        },
      });
      return { sessionSigs, expiry };
    },
    [authClient]
  );

  const handleAuth = useCallback(
    async (authMethod: AuthMethod) => {
      try {
        const pkps = await fetchMyPKPs(authMethod);
        const account = 0;
        const pub_key = pkps[account]!.publicKey;
        const { sessionSigs, expiry } = await createSession(
          pub_key,
          authMethod
        );
        return {
          username: pkps[account]?.ethAddress!,
          sessionSigs,
          expiry,
        };
      } catch (err) {
        console.error(err);
      }
    },
    [fetchMyPKPs, createSession]
  );

  const authWithPasskey = useCallback(async () => {
    const t = toast.loading('Authenticating...');
    try {
      const authMethod = await authProvider.authenticate();
      const data = await handleAuth(authMethod);

      if (!data) {
        throw new Error('Authentication failed');
      }
      const { success } = await login({
        username: data.username,
        isLoggedIn: true,
        expires: data.expiry,
        sessionSigs: data.sessionSigs,
      });
      if (!success) {
        throw new Error('Failed to login');
      }
      toast.success('Authenticated successfully', {
        id: t,
      });
      return data;
    } catch (error) {
      console.error(error);
      if (typeof error === 'object' && !!error && 'message' in error) {
        toast.error(error.message as string, {
          id: t,
        });
      } else {
        toast.error('Something went wrong. Please try again.', {
          id: t,
        });
      }
    }
  }, [authClient, handleAuth]);

  const mintPKP = async (username: string) => {
    const t = toast.loading('Minting PKP...');
    try {
      const options = await authProvider.register(username);
      const txHash = await authProvider.verifyAndMintPKPThroughRelayer(options);
      const response =
        await authProvider.relay.pollRequestUntilTerminalState(txHash);
      if (response.status !== 'Succeeded') {
        throw new Error('Minting failed');
      }
      const newPKP: IRelayPKP = {
        tokenId: response.pkpTokenId!,
        publicKey: response.pkpPublicKey!,
        ethAddress: response.pkpEthAddress!,
      };
      toast.success('PKP Minted successfully', {
        id: t,
      });
      return newPKP;
    } catch (error) {
      console.error(error);
      if (typeof error === 'object' && !!error && 'message' in error) {
        toast.error(error.message as string, {
          id: t,
        });
      } else {
        toast.error('Something went wrong. Please try again.', {
          id: t,
        });
      }
    }
  };

  useEffect(() => {
    const run = async () => {
      const connectedNodes = client.connectedNodes.size;
      if (connectedNodes === 0) {
        await client.connect();
      }
    };
    run();
  }, [client]);

  return {
    authWithPasskey,
    mintPKP,
  };
}
