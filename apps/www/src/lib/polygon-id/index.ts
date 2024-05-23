import {
  AgentResolver,
  BjjProvider,
  type CircuitData,
  CircuitId,
  CircuitStorage,
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
  ProofService,
  RHSResolver,
  W3CCredential,
  core,
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

const load = async (path: string): Promise<Uint8Array> => {
  const response = await fetch(`/circuits/${path}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

export const circuitStorage = new CircuitStorage(
  new IndexedDBDataSource<CircuitData>('polygon-id-circuit-storage')
);

export const proofService = new ProofService(
  identityWallet,
  credentialWallet,
  circuitStorage,
  dataStorage.states
);

export const initProofService = async () => {
  await circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2, {
    circuitId: CircuitId.AtomicQuerySigV2,
    wasm: await load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit.wasm`),
    provingKey: await load(
      `${CircuitId.AtomicQuerySigV2.toString()}/circuit_final.zkey`
    ),
    verificationKey: await load(
      `${CircuitId.AtomicQuerySigV2.toString()}/verification_key.json`
    ),
  });

  await circuitStorage.saveCircuitData(CircuitId.StateTransition, {
    circuitId: CircuitId.StateTransition,
    wasm: await load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
    provingKey: await load(
      `${CircuitId.StateTransition.toString()}/circuit_final.zkey`
    ),
    verificationKey: await load(
      `${CircuitId.StateTransition.toString()}/verification_key.json`
    ),
  });
};
