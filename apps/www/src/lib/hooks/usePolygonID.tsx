import {
  type CredentialRequest,
  CredentialStatusType,
  type Identity,
  byteEncoder,
  core,
} from '@0xpolygonid/js-sdk';

import { dataStorage } from '../polygon-id';
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

  const issueCredential = async (
    issuer: string,
    request: CredentialRequest
  ) => {
    const did = new core.DID({ id: issuer.slice(14), method: 'polygonid' });
    const cred = await identityWallet.issueCredential(did, request);
    return cred;
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

  return {
    identityWallet,
    credentialWallet,
    createDID,
    getAllDIDs,
    getDID,
    getAllCredentials,
    issueCredential,
  };
};

export default usePolygonID;
