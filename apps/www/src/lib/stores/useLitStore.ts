import { ProviderType } from '@lit-protocol/constants';
import { LitAuthClient, WebAuthnProvider } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import type { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import { create } from 'zustand';

const litNetwork: LIT_NETWORKS_KEYS = 'cayenne';

export const litClient = new LitNodeClient({
  litNetwork,
  debug: true,
});

const litAuthClient: LitAuthClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: 'test-api-key',
  },

  litNodeClient: litClient,
});

const litWebAuthnProvider = litAuthClient.initProvider<WebAuthnProvider>(
  ProviderType.WebAuthn
);

interface State {
  client: LitNodeClient;
  authClient: LitAuthClient;
  authProvider: WebAuthnProvider;
}

interface Actions {}

export const useLitStore = create<State & Actions>((set, get) => ({
  client: litClient,
  authClient: litAuthClient,
  authProvider: litWebAuthnProvider,
  pkpClient: null,
}));
