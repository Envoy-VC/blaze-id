import {
  CircuitId,
  type CredentialRequest,
  CredentialStatusType,
  type ZeroKnowledgeProofRequest,
} from '@0xpolygonid/js-sdk';

export const getKYCAgeCredential = (id: string, birthday: number) => {
  const credential: CredentialRequest = {
    credentialSchema:
      'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
    type: 'KYCAgeCredential',
    credentialSubject: {
      id,
      birthday,
      documentType: 99,
    },
    expiration: 1693526400,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: 'https://rhs-staging.polygonid.me',
    },
  };
  return credential;
};

export const getKYCAgeProofRequest = () => {
  const req: ZeroKnowledgeProofRequest = {
    id: 1,
    circuitId: CircuitId.AtomicQuerySigV2,
    optional: false,
    query: {
      allowedIssuers: ['*'],
      type: 'KYCAgeCredential',
      context:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
      credentialSubject: {
        birthday: {
          $lte: 1148822588722,
        },
        documentType: {
          $eq: 99,
        },
      },
    },
  };
  return req;
};
