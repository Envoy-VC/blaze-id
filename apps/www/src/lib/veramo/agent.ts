// Core interfaces
import type {
  ICredentialPlugin,
  IDIDManager,
  IDataStore,
  IDataStoreORM,
  IKeyManager,
  IResolver,
} from '@veramo/core';
import { createAgent } from '@veramo/core';
// W3C Verifiable Credential plugin
import { CredentialPlugin } from '@veramo/credential-w3c';
// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager';
// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver';
// Core key manager plugin
import { KeyManager } from '@veramo/key-manager';
// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
// TypeORM is installed with `@veramo/data-store`
import { getResolver as webDidResolver } from 'web-did-resolver';

import LitDIDStore from './LitDIDStore';
import LitKeyStore from './LitKeyStore';
import LitPrivateKeyStore from './LitPrivateKeyStore';

const INFURA_PROJECT_ID = 'sample';

export const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    ICredentialPlugin
>({
  plugins: [
    new KeyManager({
      store: new LitKeyStore(),
      kms: {
        local: new KeyManagementSystem(new LitPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new LitDIDStore(),
      defaultProvider: 'did:ethr:sepolia',
      providers: {
        'did:ethr:sepolia': new EthrDIDProvider({
          defaultKms: 'local',
          networks: [
            {
              chainId: 4,
              rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
            },
          ],
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
  ],
});
