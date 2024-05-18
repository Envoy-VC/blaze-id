import {
  AbstractPrivateKeyStore,
  type ImportablePrivateKey,
  type ManagedPrivateKey,
} from '@veramo/key-manager';

class LitPrivateKeyStore extends AbstractPrivateKeyStore {
  async getKey(args: { alias: string }): Promise<ManagedPrivateKey> {
    throw new Error('Method not implemented.');
  }

  async importKey(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    throw new Error('Method not implemented.');
  }

  async deleteKey(args: { alias: string }): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async listKeys(args: {}): Promise<ManagedPrivateKey[]> {
    throw new Error('Method not implemented.');
  }
}

export default LitPrivateKeyStore;
