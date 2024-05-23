import { CredentialStatusType, core } from '@0xpolygonid/js-sdk';

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
    return { did, credential };
  };

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
    createDID,
    getAllDIDs,
    getAllCredentials,
  };
};

export default usePolygonID;
