import type { IIdentifier } from '@veramo/core';
import { AbstractDIDStore } from '@veramo/did-manager';
import Dexie, { type Table } from 'dexie';

export class DIDStoreDatabase extends Dexie {
  dids!: Table<IIdentifier>;

  constructor() {
    super('veramo-did-store');
    this.version(1).stores({
      dids: 'did, provider',
    });
  }
}

export const db = new DIDStoreDatabase();

export default class IndexedDBDIDStore extends AbstractDIDStore {
  constructor() {
    super();
  }

  async importDID(args: IIdentifier): Promise<boolean> {
    const res = await db.dids.add(args);
    if (res === undefined) {
      throw new Error('DID not imported');
    }
    return true;
  }

  async deleteDID(args: { did: string }): Promise<boolean> {
    await db.dids.delete(args.did);
    return true;
  }

  async getDID(
    args: { did: string } | { alias: string }
  ): Promise<IIdentifier> {
    if ('alias' in args) {
      throw new Error('Alias not supported');
    } else {
      const did = await db.dids.get(args.did);
      if (did === undefined) {
        throw new Error('DID not found');
      }
      return did;
    }
  }

  async listDIDs(args: {
    alias?: string;
    provider?: string;
  }): Promise<IIdentifier[]> {
    if (args.alias && args.provider) {
      const dids = await db.dids
        .where('alias')
        .equals(args.alias)
        .and((d) => d.provider === args.provider)
        .toArray();
      return dids;
    } else if (args.alias && !args.provider) {
      const dids = await db.dids.where('alias').equals(args.alias).toArray();
      return dids;
    } else if (args.provider && !args.alias) {
      const dids = await db.dids
        .where('provider')
        .equals(args.provider)
        .toArray();
      return dids;
    } else {
      const dids = await db.dids.toArray();
      return dids;
    }
  }
}
