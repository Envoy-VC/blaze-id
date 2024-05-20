import type { IKey, ManagedKeyInfo } from '@veramo/core';
import { AbstractKeyStore } from '@veramo/key-manager';
import Dexie, { type Table } from 'dexie';

export class KeyStoreDatabase extends Dexie {
  keys!: Table<Partial<IKey>>;

  constructor() {
    super('veramo-keystore');
    this.version(1).stores({
      keys: 'kid',
    });
  }
}

const db = new KeyStoreDatabase();

export default class LocalKeyStore extends AbstractKeyStore {
  constructor() {
    super();
  }

  async importKey(args: Partial<IKey>): Promise<boolean> {
    const res = await db.keys.add(args);
    return res !== undefined;
  }

  async deleteKey(args: { kid: string }): Promise<boolean> {
    const res = await db.keys.delete(args.kid);
    return res !== undefined;
  }

  async getKey(args: { kid: string }): Promise<IKey> {
    const key = await db.keys.get(args.kid);
    if (!key) {
      throw new Error('Key not found');
    }
    return key as IKey;
  }

  async listKeys(args: {}): Promise<ManagedKeyInfo[]> {
    const keys = await db.keys.toArray();
    const managedKeys: ManagedKeyInfo[] = [];
    for (const key of keys) {
      delete key.privateKeyHex;
      managedKeys.push(key as ManagedKeyInfo);
    }
    return managedKeys;
  }
}