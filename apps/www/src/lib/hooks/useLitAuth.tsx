import { useCallback, useEffect } from 'react';

import { useLitStore } from '~/lib/stores';

import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { encryptString } from '@lit-protocol/lit-node-client';
import type {
  AuthCallbackParams,
  AuthMethod,
  IRelayPKP,
  SessionSigs,
} from '@lit-protocol/types';
import { compareAsc } from 'date-fns';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { api } from '~/trpc/react';

import { getSession, login } from '../iron-session';
import { decryptLitActionCode, getAccessControlConditions } from '../lit';

export default function useLitAuth() {
  const [sessionSigs, setSessionSigs] = useLocalStorage<SessionSigs | null>(
    'sessionSigs',
    null
  );
  const { client, authClient, authProvider } = useLitStore();
  const upload = api.storage.upload.useMutation();
  const resolve = api.storage.resolve.useMutation();

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
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.AccessControlConditionSigning,
        },
      ];

      const expiry = authClient!.litNodeClient.getExpiration();
      const session = await getSession();
      if (compareAsc(session.expires, Date.now()) === 1 && sessionSigs) {
        return {
          sessionSigs,
          expiry: session.expires,
        };
      }
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

      const sigs = await client.getSessionSigs({
        chain: 'ethereum',
        resourceAbilityRequests: resourceAbilities,
        authNeededCallback,
      });

      setSessionSigs(sigs);

      return { sessionSigs: sigs, expiry };
    },
    [authClient]
  );

  const encryptAndStore = async (data: string) => {
    if (!client.ready) {
      await client.connect();
    }
    if (!sessionSigs) {
      throw new Error('Session not found');
    }
    const { pkp } = await getSession();
    const accessControlConditions = getAccessControlConditions(pkp.ethAddress);
    const res = await encryptString(
      {
        chain: 'ethereum',
        sessionSigs,
        accessControlConditions,
        dataToEncrypt: data,
      },
      client
    );

    const cid = await upload.mutateAsync({ data: JSON.stringify(res) });

    return cid;
  };

  const decryptString = async (uri: string) => {
    if (!client.ready) {
      await client.connect();
    }
    if (!sessionSigs) {
      throw new Error('Session not found');
    }
    const { pkp } = await getSession();
    const { ciphertext, dataToEncryptHash } = await resolve.mutateAsync({
      uri,
    });

    const accessControlConditions = getAccessControlConditions(pkp.ethAddress);

    const res = await client.executeJs({
      code: decryptLitActionCode,
      sessionSigs,
      jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });
    return res.response as string;
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
      if (!client.ready) {
        await client.connect();
      }
      const authMethod = await authProvider.authenticate();
      const data = await handleAuth(authMethod);

      if (!data) {
        throw new Error('Authentication failed');
      }
      if (!data.pkp) {
        throw new Error('No PKP found');
      }
      const { success } = await login({
        pkp: data.pkp,
        isLoggedIn: true,
        expires: data.expiry,
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
      if (!client.ready) {
        await client.connect();
      }
    };
    run().catch((error) => console.error(error));

    return () => {
      client.disconnect();
    };
  }, [client]);

  return {
    authWithPasskey,
    mintPKP,
    encryptAndStore,
    decryptString,
  };
}
