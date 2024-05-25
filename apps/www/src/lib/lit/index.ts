import { type AccessControlConditions } from '@lit-protocol/types';

export const getAccessControlConditions = (
  address: string
): AccessControlConditions => {
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: address,
      },
    },
  ];
};

export const decryptLitActionCode = `
(async () => {
  const resp = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });

  Lit.Actions.setResponse({ response: resp });
})();
`;
