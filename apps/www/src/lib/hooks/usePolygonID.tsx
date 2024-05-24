import {
  CircuitId,
  type CredentialRequest,
  CredentialStatusType,
  W3CCredential,
  type ZeroKnowledgeProofRequest,
  core,
} from '@0xpolygonid/js-sdk';

import { dataStorage, proofService } from '../polygon-id';
import { credentialWallet, identityWallet } from '../polygon-id';

const usePolygonID = () => {
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

    console.log(did);
    return { did, credential };
  };

  const deleteCredential = async (id: string) => {
    await credentialWallet.remove(id);
  };

  const issueCredential = async (
    issuer: string,
    request: CredentialRequest
  ) => {
    const did = new core.DID({ id: issuer.slice(14), method: 'polygonid' });
    const credential = await identityWallet.issueCredential(did, request);
    await dataStorage.credential.saveCredential(credential);
    await identityWallet.addCredentialsToMerkleTree([credential], did);
    await identityWallet.publishStateToRHS(
      did,
      'https://rhs-staging.polygonid.me'
    );
    return credential;
  };
  const importCredential = async (credential: W3CCredential, id: string) => {
    const did = new core.DID({ id: id.slice(14), method: 'polygonid' });
    await dataStorage.credential.saveCredential(credential);
    await identityWallet.addCredentialsToMerkleTree([credential], did);
    await identityWallet.publishStateToRHS(
      did,
      'https://rhs-staging.polygonid.me'
    );
  };

  const getAllDIDs = async () => {
    const identities = await dataStorage.identity.getAllIdentities();
    return identities;
  };

  const getDID = async (did: string) => {
    const identity = await dataStorage.identity.getIdentity(did);
    return identity;
  };

  const getAllCredentials = async () => {
    const credentials = await dataStorage.credential.listCredentials();
    return credentials;
  };

  const getCredential = async (id: string) => {
    const credential = await dataStorage.credential.findCredentialById(id);
    return credential;
  };

  const verifyCredential = async (
    proofReq: ZeroKnowledgeProofRequest,
    credential: W3CCredential,
    user: string
  ) => {
    const did = new core.DID({ id: user.slice(14), method: 'polygonid' });
    const proof = await proofService.generateProof(proofReq, did, {
      skipRevocation: true,
      credential,
    });

    const success = await proofService.verifyProof(
      proof,
      CircuitId.AtomicQuerySigV2
    );

    return { proof, success };
  };

  return {
    identityWallet,
    credentialWallet,
    createDID,
    getAllDIDs,
    getDID,
    getAllCredentials,
    issueCredential,
    deleteCredential,
    getCredential,
    verifyCredential,
    importCredential,
  };
};

export default usePolygonID;
