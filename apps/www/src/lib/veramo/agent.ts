// Core interfaces
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
// W3C Verifiable Credential plugin
import { CredentialPlugin } from '@veramo/credential-w3c';
import {
  DIDStore,
  Entities,
  type IDataStoreORM,
  KeyStore,
  PrivateKeyStore,
  migrations,
} from '@veramo/data-store';
// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager';
// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { WebDIDProvider } from '@veramo/did-provider-web';
// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver';
// Core key manager plugin
import { KeyManager } from '@veramo/key-manager';
// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as keyDidResolver } from 'key-did-resolver';
import { DataSource } from 'typeorm';
// TypeORM is installed with `@veramo/data-store`
import { getResolver as webDidResolver } from 'web-did-resolver';
import { env } from '~/env';

export const runtime = 'node';

const dbConnection = new DataSource({
  type: 'postgres',
  url: env.POSTGRES_URL,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
}).initialize();

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
      // @ts-ignore
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(
          // @ts-ignore
          new PrivateKeyStore(dbConnection, new SecretBox(env.KMS_SECRET_KEY))
        ),
      },
    }),
    new DIDManager({
      // @ts-ignore
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({
          defaultKms: 'local',
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...webDidResolver(),
        ...keyDidResolver(),
      }),
    }),
    new CredentialPlugin(),
    new CredentialIssuerEIP712(),
  ],
});

export default veramoAgent;
