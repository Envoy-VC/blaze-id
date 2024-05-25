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

export const db = new PrivateKeyDatabase();

export default class IndexedDBPrivateKeyStore extends AbstractPrivateKeyStore {
  constructor() {
    super();
  }

  async importKey(args: ManagedPrivateKey): Promise<ManagedPrivateKey> {
    const exists = await db.keys.get(args.alias);
    if (exists) {
      throw new Error('Key already exists with alias ' + args.alias);
    }
    await db.keys.add(args, args.alias);
    return args;
  }

  async getKey(args: { alias: string }): Promise<ManagedPrivateKey> {
    const key = await db.keys.get(args.alias);
    if (!key) {
      throw new Error('Key not found');
    }
    return key;
  }

  async deleteKey(args: { alias: string }): Promise<boolean> {
    const key = await db.keys.get(args.alias);
    if (!key) {
      throw new Error('Key not found');
    }
    await db.keys.delete(key.alias);
    return true;
  }

  async listKeys(args: {}): Promise<ManagedPrivateKey[]> {
    const keys = await db.keys.toArray();
    return keys;
  }
}
