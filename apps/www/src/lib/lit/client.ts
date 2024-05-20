import { ProviderType } from '@lit-protocol/constants';
import { LitAuthClient, WebAuthnProvider } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import type { IRelayPKP, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

const litNetwork: LIT_NETWORKS_KEYS = 'habanero';

const litClient = new LitNodeClient({
  litNetwork,
});

export const litAuthClient: LitAuthClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: 'test-api-key',
  },
  litNodeClient: litClient,
});

const litWebAuthnProvider = litAuthClient.initProvider<WebAuthnProvider>(
  ProviderType.WebAuthn
);

export const mintPKP = async (username: string) => {
  const options = await litWebAuthnProvider.register(username);
  console.log(options);
  const txId =
    await litWebAuthnProvider.verifyAndMintPKPThroughRelayer(options);
  const response =
    await litWebAuthnProvider.relay.pollRequestUntilTerminalState(txId);
  if (response.status !== 'Succeeded') {
    throw new Error('Minting failed');
  }
  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId!,
    publicKey: response.pkpPublicKey!,
    ethAddress: response.pkpEthAddress!,
  };
  return newPKP;
};

export const authenticatePKP = async () => {
  const data = await litWebAuthnProvider.authenticate();
  console.log({
    method: data.authMethodType,
    accessToken: JSON.parse(data.accessToken),
  });
  const res = await litWebAuthnProvider.fetchPKPsThroughRelayer(data);
  console.log(res);
};

export default litClient;
