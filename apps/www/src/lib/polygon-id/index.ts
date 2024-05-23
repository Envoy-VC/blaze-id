import {
  AgentResolver,
  BjjProvider,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  EthStateStorage,
  type Identity,
  IdentityStorage,
  IdentityWallet,
  IndexedDBDataSource,
  IndexedDBPrivateKeyStore,
  IssuerResolver,
  KMS,
  KmsKeyType,
  MerkleTreeIndexedDBStorage,
  type Profile,
  RHSResolver,
  W3CCredential,
  defaultEthConnectionConfig,
} from '@0xpolygonid/js-sdk';

export const dataStorage = {
  credential: new CredentialStorage(
    new IndexedDBDataSource<W3CCredential>('polygon-id-credential-store')
  ),
  identity: new IdentityStorage(
    new IndexedDBDataSource<Identity>('polygon-id-identity-store'),
    new IndexedDBDataSource<Profile>('polygon-id-profile-store')
  ),
  mt: new MerkleTreeIndexedDBStorage(40),
  states: new EthStateStorage(defaultEthConnectionConfig),
};

const memoryKeyStore = new IndexedDBPrivateKeyStore();
const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
const kms = new KMS();
kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

const statusRegistry = new CredentialStatusResolverRegistry();
statusRegistry.register(
  CredentialStatusType.SparseMerkleTreeProof,
  new IssuerResolver()
);
statusRegistry.register(
  CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
  new RHSResolver(dataStorage.states)
);

statusRegistry.register(
  CredentialStatusType.Iden3commRevocationStatusV1,
  new AgentResolver()
);

export const credentialWallet = new CredentialWallet(
  dataStorage,
  statusRegistry
);
export const identityWallet = new IdentityWallet(
  kms,
  dataStorage,
  credentialWallet
);
