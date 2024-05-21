import { AbstractPrivateKeyStore } from '@0xpolygonid/js-sdk';
import { AbstractSecretBox } from '@veramo/key-manager';
import Dexie, { type Table } from 'dexie';

interface IPolygonIDKey {
  alias: string;
  key: string;
}

export class PolygonIDPrivateKeyStoreDB extends Dexie {
  keys!: Table<IPolygonIDKey>;

  constructor() {
    super('polygon-id-private-key-store');
    this.version(1).stores({
      keys: 'alias',
    });
  }
}

const db = new PolygonIDPrivateKeyStoreDB();

export default class PolygonIDPrivateKeyStore extends AbstractPrivateKeyStore {
  secretBox: AbstractSecretBox;
  constructor(secretBox: AbstractSecretBox) {
    super();
    this.secretBox = secretBox;
  }

  async importKey(key: IPolygonIDKey): Promise<void> {
    const exists = await db.keys.get(key.alias);
    if (exists) {
      throw new Error('Key already exists');
    }
    key.key = await this.secretBox.encrypt(key.key);
    await db.keys.add(key);
  }

  async get(args: { alias: string }): Promise<string> {
    const key = await db.keys.get(args.alias);
    if (!key) {
      throw new Error('Key not found');
    }
    key.key = await this.secretBox.decrypt(key.key);
    return key.key;
  }
}
