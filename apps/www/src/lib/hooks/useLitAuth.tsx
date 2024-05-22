import { useCallback, useEffect } from 'react';

import { useLitStore } from '~/lib/stores';

import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import type { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types';
import { toast } from 'sonner';
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
    const t = toast.loading('Authenticating...');
    try {
      const authMethod = await authProvider.authenticate();
      await handleAuth(authMethod);
      toast.success('Authenticated successfully', {
        id: t,
      });
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
    sessionDetails,
    mintPKP,
  };
}
