import { encryptToJson } from '@lit-protocol/lit-node-client';

import litClient from './client';

const encrypt = async (message: string) => {
  const res = await encryptToJson({
    litNodeClient: litClient,
    string: message,
    chain: 'ethereum',
  });
};
