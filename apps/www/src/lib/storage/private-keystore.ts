import {
  AbstractPrivateKeyStore,
  type ManagedPrivateKey,
} from '@veramo/key-manager';
import Dexie, { type Table } from 'dexie';

export class PrivateKeyDatabase extends Dexie {
  keys!: Table<ManagedPrivateKey>;

  constructor() {
    super('veramo-private-keystore');
    this.version(1).stores({
      keys: 'alias',
    });
  }
}

const db = new PrivateKeyDatabase();

export default class LocalPrivateKeyStore extends AbstractPrivateKeyStore {
  constructor() {
    super();
  }

  async importKey(args: ManagedPrivateKey): Promise<ManagedPrivateKey> {
    const res = await db.keys.add(args);
    if (res === undefined) {
      throw new Error('Key not imported');
    }
    return args;
  }

  async getKey(args: { alias: string }): Promise<ManagedPrivateKey> {
    const key = await db.keys.get(args.alias);
    if (key === undefined) {
      throw new Error('Key not found');
    }
    return key;
  }

  async deleteKey(args: { alias: string }): Promise<boolean> {
    const res = await db.keys.delete(args.alias);
    return true;
  }

  async listKeys(args: {}): Promise<ManagedPrivateKey[]> {
    const keys = await db.keys.toArray();
    return keys;
  }
}
