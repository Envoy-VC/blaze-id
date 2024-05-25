import { useCallback, useEffect } from 'react';

import { useLitStore } from '~/lib/stores';

import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { LitNetwork } from '@lit-protocol/constants';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import type {
  AuthCallbackParams,
  AuthMethod,
  IRelayPKP,
} from '@lit-protocol/types';
import { compareAsc } from 'date-fns';
import { toast } from 'sonner';

import { getSession, login } from '../iron-session';
import { getCapacityDelegationAuthSig } from '../lit';

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
    async (pkp: IRelayPKP, authMethod: AuthMethod) => {
      const resourceAbilities = [
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ];
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
      const authNeededCallback = async (params: AuthCallbackParams) => {
        const sessionKeyPair = client.getSessionKey();
        const response = await client.signSessionKey({
          sessionKey: sessionKeyPair,
          statement: params.statement,
          authMethods: [authMethod],
          pkpPublicKey: pkp.publicKey,
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,
        });
        return response.authSig;
      };

      const { capacityDelegationAuthSig } = await getCapacityDelegationAuthSig({
        delegateeAddresses: [pkp.ethAddress],
      });

      const sessionSigs = await client.getSessionSigs({
        chain: 'ethereum',
        resourceAbilityRequests: resourceAbilities,
        capacityDelegationAuthSig,
        authNeededCallback,
      });

      return { sessionSigs, expiry };
    },
    [authClient]
  );

  const getPKPClient = async () => {
    const { pkp, sessionSigs } = await getSession();
    const pkpWallet = new PKPEthersWallet({
      litNetwork: LitNetwork.Habanero,
      pkpPubKey: pkp.publicKey,
      controllerSessionSigs: sessionSigs,
    });
    await pkpWallet.init();
    return pkpWallet;
  };

  const handleAuth = useCallback(
    async (authMethod: AuthMethod) => {
      try {
        const pkps = await fetchMyPKPs(authMethod);
        const account = 0;
        const pkp = pkps[account]!;
        const { sessionSigs, expiry } = await createSession(pkp, authMethod);
        return {
          pkp: pkps[account],
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
        pkp: data.pkp!,
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
    getPKPClient,
  };
}
