import React from 'react';

import {
  type CircuitData,
  CircuitId,
  CircuitStorage,
  CredentialStatusType,
  type ICredentialWallet,
  type IIdentityWallet,
  type IStateStorage,
  IndexedDBDataSource,
  ProofService,
  core,
} from '@0xpolygonid/js-sdk';
import { toast } from 'sonner';

import { dataStorage } from '../polygon-id';
import { credentialWallet, identityWallet } from '../polygon-id';

const load = async (path: string): Promise<Uint8Array> => {
  const response = await fetch(`/circuits/${path}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

const usePolygonID = () => {
  const [proofService, setProofService] = React.useState<ProofService | null>(
    null
  );

  const initProofService = async (
    identityWallet: IIdentityWallet,
    credentialWallet: ICredentialWallet,
    stateStorage: IStateStorage
  ): Promise<ProofService> => {
    const id = toast.loading('Initializing Proof Service');
    const circuitStorage = new CircuitStorage(
      new IndexedDBDataSource<CircuitData>('polygon-id-circuit-storage')
    );

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

    const proofService = new ProofService(
      identityWallet,
      credentialWallet,
      circuitStorage,
      stateStorage
    );
    setProofService(proofService);
    toast.success('Proof Service Initialized', { id });
    return proofService;
  };
  const createDID = async () => {
    const { did, credential } = await identityWallet.createIdentity({
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

  React.useEffect(() => {
    const init = async () => {
      await initProofService(
        identityWallet,
        credentialWallet,
        dataStorage.states
      );
    };
    init();
  }, []);

  const getAllDIDs = async () => {
    const identities = await dataStorage.identity.getAllIdentities();
    return identities;
  };
  const getAllCredentials = async () => {
    const credentials = await dataStorage.credential.listCredentials();
    return credentials;
  };

  return {
    identityWallet,
    credentialWallet,
    proofService,
    createDID,
    getAllDIDs,
    getAllCredentials,
  };
};

export default usePolygonID;
