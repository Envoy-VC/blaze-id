import {
  CircuitId,
  type CredentialRequest,
  CredentialStatusType,
  type ZeroKnowledgeProofRequest,
} from '@0xpolygonid/js-sdk';

export const getKYCAgeCredential = (
  id: string,
  birthday: number,
  expiry: number
) => {
  const credential: CredentialRequest = {
    credentialSchema:
      'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
    type: 'KYCAgeCredential',
    credentialSubject: {
      id,
      birthday: Math.round(birthday / 1000),
      documentType: 99,
    },
    expiration: Math.round(expiry / 1000),
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: 'https://rhs-staging.polygonid.me',
    },
  };

  return credential;
};

export const getKYCAgeProofRequest = () => {
  const required = Math.round(
    (Date.now() - 18 * 365 * 24 * 60 * 60 * 1000) / 1000
  );
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
          $lt: required,
        },
      },
    },
  };
  return req;
};
