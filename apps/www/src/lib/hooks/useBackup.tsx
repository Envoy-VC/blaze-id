import React from 'react';

import {
  type Identity,
  IndexedDBDataSource,
  type Profile,
  W3CCredential,
} from '@0xpolygonid/js-sdk';
import type { IIdentifier, IKey, IMessage } from '@veramo/core';
import type { ManagedPrivateKey } from '@veramo/key-manager';
import { toast } from 'sonner';

import { dataStorage, identityWallet } from '../polygon-id';
import type { Credential, Presentation } from '../storage/datastore';
import { db as dataStoreDB } from '../storage/datastore';
import { db as didDB } from '../storage/did';
import { db as keyStoreDB } from '../storage/keystore';
import { db as pkKeyStoreDB } from '../storage/private-keystore';
import useLitAuth from './useLitAuth';

const useBackup = () => {
  const { encryptAndStore, decryptString } = useLitAuth();
  const createBackup = async () => {
    const id = toast.loading('Creating backup...');
    try {
      const veramoMessages = await dataStoreDB.messages.toArray();
      const veramoCredentials = await dataStoreDB.credentials.toArray();
      const veramoPresentations = await dataStoreDB.presentations.toArray();
      const veramodids = await didDB.dids.toArray();
      const veramoKeys = await keyStoreDB.keys.toArray();
      const veramoPrivateKeys = await pkKeyStoreDB.keys.toArray();

      const i = new IndexedDBDataSource<Identity>('polygon-id-identity-store');
      const p = new IndexedDBDataSource<Profile>('polygon-id-profile-store');

      const polygonIDCredentials = (
        await dataStorage.credential.listCredentials()
      ).map((c) => c.toJSON());

      const polygonIDIdentities = await i.load();
      const polygonIDProfiles = await p.load();
      const localStorageItems: Record<string, any> = {};
      let index = 0;

      while (localStorage.key(index)) {
        const key = localStorage.key(index);
        if (!key) continue;
        localStorageItems[key] = localStorage.getItem(key);
        index++;
      }

      const data = {
        veramoMessages,
        veramoCredentials,
        veramoPresentations,
        veramodids,
        veramoKeys,
        veramoPrivateKeys,
        polygonIDCredentials,
        polygonIDIdentities,
        polygonIDProfiles,
        localStorageItems,
      };

      console.log(data);
      const uri = await encryptAndStore(JSON.stringify(data));
      toast.success('Backup created', { id });
      return uri;
    } catch (error) {
      console.error(error);
      toast.error('Error creating backup', { id });
      return '';
    }
  };

  const restoreBackup = async (uri: string) => {
    const id = toast.loading('Restoring backup...');
    try {
      const data = await decryptString(uri);
      const parsedData = JSON.parse(data) as {
        veramoMessages: IMessage[];
        veramoCredentials: Credential[];
        veramoPresentations: Presentation[];
        veramodids: IIdentifier[];
        veramoKeys: Partial<IKey>[];
        veramoPrivateKeys: ManagedPrivateKey[];
        polygonIDCredentials: W3CCredential[];
        polygonIDIdentities: Identity[];
        polygonIDProfiles: Profile[];
        localStorageItems: Record<string, any>;
      };

      await dataStoreDB.messages.bulkPut(parsedData.veramoMessages);
      await dataStoreDB.credentials.bulkPut(parsedData.veramoCredentials);
      await dataStoreDB.presentations.bulkPut(parsedData.veramoPresentations);
      await didDB.dids.bulkPut(parsedData.veramodids);
      await keyStoreDB.keys.bulkPut(parsedData.veramoKeys);
      await pkKeyStoreDB.keys.bulkPut(parsedData.veramoPrivateKeys);

      for (const credential of parsedData.polygonIDCredentials) {
        const cred = W3CCredential.fromJSON(credential);
        await dataStorage.credential.saveCredential(cred);
      }

      const i = new IndexedDBDataSource<Identity>('polygon-id-identity-store');
      const p = new IndexedDBDataSource<Profile>('polygon-id-profile-store');
      for (const identity of parsedData.polygonIDIdentities) {
        await i.save(identity.did, identity, 'did');
      }
      for (const profile of parsedData.polygonIDProfiles) {
        await p.save(profile.id, profile, 'id');
      }

      for (const key in parsedData.localStorageItems) {
        localStorage.setItem(key, parsedData.localStorageItems[key]);
      }
      toast.success('Backup restored', { id });
    } catch (error) {
      console.error(error);
      toast.error('Error restoring backup', { id });
    }
  };
  return { createBackup, restoreBackup };
};

export default useBackup;
