import {
  BjjProvider,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  EthStateStorage,
  type Identity,
  IdentityStorage,
  IdentityWallet,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  IssuerResolver,
  KMS,
  KmsKeyType,
  type Profile,
  RHSResolver,
  W3CCredential,
  byteEncoder,
  core,
  defaultEthConnectionConfig,
} from '@0xpolygonid/js-sdk';

const dataStorage = {
  credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
  identity: new IdentityStorage(
    new InMemoryDataSource<Identity>(),
    new InMemoryDataSource<Profile>()
  ),
  mt: new InMemoryMerkleTreeStorage(40),
  states: new EthStateStorage(defaultEthConnectionConfig),
};

const memoryKeyStore = new InMemoryPrivateKeyStore();
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
const credWallet = new CredentialWallet(dataStorage, statusRegistry);
const wallet = new IdentityWallet(kms, dataStorage, credWallet);

export const createPolygonIDDID = async () => {
  const { did, credential } = await wallet.createIdentity({
    method: core.DidMethod.PolygonId,
    blockchain: core.Blockchain.Polygon,
    networkId: core.NetworkId.Amoy,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: 'https://rhs-staging.polygonid.me',
    },
  });

  return { did, credential };
};
