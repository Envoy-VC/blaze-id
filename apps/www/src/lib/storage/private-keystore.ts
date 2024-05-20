import {
  AbstractPrivateKeyStore,
  AbstractSecretBox,
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
  private secretBox: AbstractSecretBox;
  constructor(secretBox: AbstractSecretBox) {
    super();
    this.secretBox = secretBox;
  }

  async importKey(args: ManagedPrivateKey): Promise<ManagedPrivateKey> {
    const exists = await db.keys.get(args.alias);
    if (exists) {
      throw new Error('Key already exists with alias ' + args.alias);
    }
    args.privateKeyHex = await this.secretBox.encrypt(args.privateKeyHex);
    await db.keys.add(args, args.alias);
    return args;
  }

  async getKey(args: { alias: string }): Promise<ManagedPrivateKey> {
    const key = await db.keys.get(args.alias);
    if (!key) {
      throw new Error('Key not found');
    }
    key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex);
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
    for (const key of keys) {
      key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex);
    }
    return keys;
  }
}
