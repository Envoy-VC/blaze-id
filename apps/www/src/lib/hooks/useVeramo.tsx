import type {
  ICreateVerifiableCredentialArgs,
  VerifiableCredential,
} from '@veramo/core';
import { v4 as uuid } from 'uuid';

import { db as dataStoreDB } from '../storage/datastore';
import { db as didDB } from '../storage/did';
import { agent, veramoDIDManagerOptions } from '../veramo';

export interface CreateKeyDIDOptions {
  keyType?: 'Ed25519' | 'X25519' | 'Secp256k1' | undefined;
}

interface CreateWebDIDOptions {}

interface CreateEthrDIDOptions {}

export interface CreateKeyOptions {
  alias?: string;
  kms?: string;
  provider: keyof (typeof veramoDIDManagerOptions)['providers'];
  options?: CreateKeyDIDOptions | CreateWebDIDOptions | CreateEthrDIDOptions;
}

const useVeramo = () => {
  const createDID = async (options: CreateKeyOptions) => {
    if (!options.alias) {
      options.alias = uuid();
    }
    const identifier = await agent.didManagerCreate({
      alias: options.alias,
      provider: options.provider,
      options: options.options,
    });
    return identifier;
  };
  const deleteDID = async (did: string) => {
    const success = await agent.didManagerDelete({
      did,
    });
    return success;
  };

  const createCredential = async (options: ICreateVerifiableCredentialArgs) => {
    try {
      const verifiableCredential =
        await agent.createVerifiableCredential(options);
      console.log(verifiableCredential);
      const hash = await agent.dataStoreSaveVerifiableCredential({
        verifiableCredential,
      });
      return hash;
    } catch (error) {
      console.log(error);
    }
  };
  const deleteCredential = async (hash: string) => {
    await agent.dataStoreDeleteVerifiableCredential({ hash });
  };

  const verifyCredential = async (credential: VerifiableCredential) => {
    const result = await agent.verifyCredential({
      credential,
      fetchRemoteContexts: true,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.verified;
  };

  const getDIDByAlias = async (alias: string) => {
    const res = await agent.didManagerGetByAlias({
      alias,
    });
    return res;
  };

  const getAllDIDs = async () => {
    const res = await didDB.dids.toArray();
    return res;
  };

  const getCredentialByHash = async (hash: string) => {
    const res = await agent.dataStoreGetVerifiableCredential({
      hash,
    });
    return res;
  };

  const getAllCredentials = async () => {
    const res = await dataStoreDB.credentials.toArray();
    return res;
  };

  return {
    agent,
    createDID,
    deleteDID,
    getDIDByAlias,
    getAllDIDs,
    createCredential,
    verifyCredential,
    getCredentialByHash,
    getAllCredentials,
    deleteCredential,
  };
};

export default useVeramo;
