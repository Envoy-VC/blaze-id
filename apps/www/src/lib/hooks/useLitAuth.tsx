import { useCallback, useEffect } from 'react';

import { useLitStore } from '~/lib/stores';

import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import type { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types';
import { useLocalStorage } from 'usehooks-ts';

export default function useLitAuth() {
  const { client, authClient, authProvider } = useLitStore();

  const [sessionDetails, setSessionDetails] = useLocalStorage<{
    sessionSigs: SessionSigs;
    expiry: string;
  } | null>('sessionDetails', null);

  const fetchMyPKPs = useCallback(
    async (authMethod: AuthMethod): Promise<IRelayPKP[]> => {
      const pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
      return pkps;
    },
    [authClient]
  );

  const createSession = useCallback(
    async (pkpPublicKey: string, authMethod: AuthMethod) => {
      const currentExpiry = sessionDetails?.expiry ?? '';
      if (
        sessionDetails &&
        currentExpiry &&
        new Date(currentExpiry) > new Date()
      ) {
        return sessionDetails;
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
      setSessionDetails({ sessionSigs, expiry });
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
        const sigs = await createSession(pub_key, authMethod);
        return sigs;
      } catch (err) {
        console.error(err);
      }
    },
    [fetchMyPKPs, createSession]
  );

  const authWithPasskey = useCallback(async () => {
    try {
      const authMethod = await authProvider.authenticate();
      return await handleAuth(authMethod);
    } catch (error) {
      console.error(error);
    }
  }, [authClient, handleAuth]);

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
    sessionDetails,
  };
}
