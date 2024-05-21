import { CredentialStatusType, core } from '@0xpolygonid/js-sdk';

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

  return {
    identityWallet,
    credentialWallet,
    createDID,
  };
};

export default usePolygonID;
