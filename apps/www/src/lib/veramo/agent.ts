import type {
  ICredentialPlugin,
  IDIDManager,
  IDataStore,
  IKeyManager,
  IResolver,
} from '@veramo/core';
import { createAgent } from '@veramo/core';
import {
  CredentialIssuerEIP712,
  type ICredentialIssuerEIP712,
} from '@veramo/credential-eip712';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { type IDataStoreORM } from '@veramo/data-store';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as keyDidResolver } from 'key-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { env } from '~/env';

import { LocalDIDStore, LocalKeyStore, LocalPrivateKeyStore } from '../storage';

const veramoAgent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    ICredentialPlugin &
    ICredentialIssuerEIP712
>({
  plugins: [
    new KeyManager({
      store: new LocalKeyStore(),
      kms: {
        local: new KeyManagementSystem(
          new LocalPrivateKeyStore(new SecretBox(env.KMS_SECRET_KEY))
        ),
      },
    }),
    new DIDManager({
      // @ts-ignore
      store: new LocalDIDStore(),
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({
          defaultKms: 'local',
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
        'did:ethr:mainnet': new EthrDIDProvider({
          defaultKms: 'local',
          networks: [
            {
              name: 'mainnet',
              rpcUrl: 'https://mainnet.infura.io/v3/',
            },
          ],
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...webDidResolver(),
        ...keyDidResolver(),
        ...ethrDidResolver({
          networks: [
            { name: 'mainnet', rpcUrl: 'https://mainnet.infura.io/v3/' },
          ],
        }),
      }),
    }),
    new CredentialPlugin(),
    new CredentialIssuerEIP712(),
  ],
});

export default veramoAgent;
