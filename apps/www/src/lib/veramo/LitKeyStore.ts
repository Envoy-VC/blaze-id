import type { IKey, ManagedKeyInfo } from '@veramo/core';
import { AbstractKeyStore } from '@veramo/key-manager';

class LitKeyStore extends AbstractKeyStore {
  async getKey(args: { kid: string }): Promise<IKey> {
    const key: IKey = {
      kid: '',
      kms: '',
      type: 'Secp256k1',
      publicKeyHex: '',
    };
    return key;
  }

  async deleteKey(args: { kid: string }): Promise<boolean> {
    return true;
  }

  async importKey(args: Partial<IKey>): Promise<boolean> {
    return Promise.resolve(true);
  }

  async listKeys(args: {}): Promise<ManagedKeyInfo[]> {
    return Promise.resolve([]);
  }
}

export default LitKeyStore;
