import React, { useState } from 'react';

import {
  BjjProvider,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialWallet,
  IdentityWallet,
  IssuerResolver,
  KMS,
  KmsKeyType,
  RHSResolver,
  core,
} from '@0xpolygonid/js-sdk';
import { SecretBox } from '@veramo/kms-local';
import { useLocalStorage } from 'usehooks-ts';

import { dataStorage } from '../polygon-id';
import { PolygonIDPrivateKeyStore } from '../storage';

const usePolygonID = () => {
  const [kmsSecretKey] = useLocalStorage<string | null>('KMS_SECRET_KEY', null);
  const [identityWallet, setIdentityWallet] = useState<IdentityWallet | null>(
    null
  );
  const [credentialWallet, setCredentialWallet] =
    useState<CredentialWallet | null>(null);

  const createDID = async () => {
    if (!identityWallet) return;
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

  const initialize = (kmsKey: string) => {
    const memoryKeyStore = new PolygonIDPrivateKeyStore(new SecretBox(kmsKey));
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
    setIdentityWallet(wallet);
    setCredentialWallet(credWallet);
  };

  React.useEffect(() => {
    if (kmsSecretKey) {
      initialize(kmsSecretKey);
    }
  }, [kmsSecretKey]);

  return {
    identityWallet,
    credentialWallet,
    createDID,
  };
};

export default usePolygonID;
