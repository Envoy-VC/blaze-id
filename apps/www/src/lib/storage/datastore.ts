import type * as Types from '@veramo/core';
import { schema } from '@veramo/core';
import type { IDataStore } from '@veramo/data-store';
import Dexie, { type Table } from 'dexie';
import { sha256 } from 'sha.js';

interface Credential extends Types.VerifiableCredential {
  hash: string;
}

interface Presentation extends Types.VerifiablePresentation {
  hash: string;
}

export class DataStoreDB extends Dexie {
  messages!: Table<Types.IMessage>;
  credentials!: Table<Credential>;
  presentations!: Table<Presentation>;

  constructor() {
    super('veramo-data-store');
    this.version(1).stores({
      messages: 'id',
      credentials: 'hash',
      presentations: 'hash',
    });
  }
}

export const db = new DataStoreDB();

export default class IndexedDBDataStore implements Types.IAgentPlugin {
  readonly methods: IDataStore;
  readonly schema = schema.IDataStore;

  constructor() {
    this.methods = {
      dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
      dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
      dataStoreDeleteMessage: this.dataStoreDeleteMessage.bind(this),
      dataStoreDeleteVerifiableCredential:
        this.dataStoreDeleteVerifiableCredential.bind(this),
      dataStoreSaveVerifiableCredential:
        this.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreGetVerifiableCredential:
        this.dataStoreGetVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation:
        this.dataStoreSaveVerifiablePresentation.bind(this),
      dataStoreGetVerifiablePresentation:
        this.dataStoreGetVerifiablePresentation.bind(this),
    };
  }

  async dataStoreGetMessage(
    args: Types.IDataStoreGetMessageArgs
  ): Promise<Types.IMessage> {
    const message = await db.messages.get(args.id);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  async dataStoreSaveMessage(
    args: Types.IDataStoreSaveMessageArgs
  ): Promise<string> {
    await db.messages.add(args.message);
    const res = await db.messages.get(args.message.id);
    if (!res) {
      throw new Error('Message not saved');
    }
    return res.id;
  }

  async dataStoreDeleteMessage(
    args: Types.IDataStoreDeleteMessageArgs
  ): Promise<boolean> {
    await db.messages.delete(args.id);
    const msg = await db.messages.get(args.id);
    if (msg) {
      throw new Error('Message not deleted');
    }
    return true;
  }

  async dataStoreGetVerifiableCredential(
    args: Types.IDataStoreGetVerifiableCredentialArgs
  ): Promise<Types.VerifiableCredential> {
    const credential = await db.credentials.get(args.hash);
    if (!credential) {
      throw new Error('Credential not found');
    }
    return credential;
  }

  async dataStoreSaveVerifiableCredential(
    args: Types.IDataStoreSaveVerifiableCredentialArgs
  ): Promise<string> {
    const hash = new sha256()
      .update(JSON.stringify(args.verifiableCredential))
      .digest('hex');

    const credential: Credential = {
      ...args.verifiableCredential,
      hash,
    };
    await db.credentials.add(credential);
    const res = await db.credentials.get(hash);
    if (!res) {
      throw new Error('Credential not saved');
    }
    return hash;
  }

  async dataStoreDeleteVerifiableCredential(
    args: Types.IDataStoreDeleteVerifiableCredentialArgs
  ): Promise<boolean> {
    await db.credentials.delete(args.hash);
    const credential = await db.credentials.get(args.hash);
    if (credential) {
      throw new Error('Credential not deleted');
    }
    return true;
  }

  async dataStoreGetVerifiablePresentation(
    args: Types.IDataStoreGetVerifiablePresentationArgs
  ): Promise<Types.VerifiablePresentation> {
    const presentation = await db.presentations.get(args.hash);
    if (!presentation) {
      throw new Error('Verifiable Presentation not found');
    }
    return presentation;
  }

  async dataStoreSaveVerifiablePresentation(
    args: Types.IDataStoreSaveVerifiablePresentationArgs
  ): Promise<string> {
    const hash = new sha256()
      .update(JSON.stringify(args.verifiablePresentation))
      .digest('hex');

    const presentation: Presentation = {
      ...args.verifiablePresentation,
      hash,
    };
    await db.presentations.add(presentation);
    const res = await db.presentations.get(hash);
    if (!res) {
      throw new Error('Presentation not saved');
    }
    return hash;
  }
}
